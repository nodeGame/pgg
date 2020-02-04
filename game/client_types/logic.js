/**
* # Logic code for Meritocracy Game
* Copyright(c) 2017 Stefano Balietti
* MIT Licensed
*
* http://www.nodegame.org
* ---
*/

var path = require('path');
var fs   = require('fs-extra');

var ngc = require('nodegame-client');
var J = ngc.JSUS;


module.exports = function(treatmentName, settings, stager, setup, gameRoom) {

    var channel = gameRoom.channel;
    var node = gameRoom.node;
    var groupSize = gameRoom.game.waitroom.GROUP_SIZE;

    stager.setDefaultProperty('minPlayers', [ groupSize ]);

    // Event handler registered in the init function are always valid.
    stager.setOnInit(function() {
        console.log('********************** socmob ' + gameRoom.name);

        // Keep tracks of results sent to players in case of disconnections.
        node.game.incomes = {};

        // Add session name to data in DB.
        node.game.memory.on('insert', function(o) {
            o.session = node.nodename;
        });
    });

    // Extends Stages and Steps where needed.

    stager.extendStep('effort', {
        init: function() {
            var efforts = [];
            node.game.efforts = efforts;
        },
        cb: function() {
            node.on.data('done', function(msg) {
                node.game.efforts.push({
                    id: msg.from,
                    effort: msg.data.effort
                });
            });
        }
    });

    //THIS IS BID IN MERIT-BASED TREATMENT (Treatment 1)
    stager.extendStep('bid', {
        init: function() {
            // Counter for total contributions in this round.
            this.totalContr = 0;
        },
        cb: function() {
            // Sort them
            var sorted = node.game.efforts.sort(function(a, b) {
                return b.effort - a.effort;
            });
            // to get from game.settings
            var m = node.game.settings.N_HIGH;
            var H = node.game.settings.HIGH;
            var L = node.game.settings.LOW;

            var pid, income;
            for (var i = 0; i < sorted.length; i++) {
                if (i < m) income = H;
                else income = L;
                pid = sorted[i].id;
                node.say('income', pid, income);
                this.incomes[pid] = income;
            }

            // Keep count of total contributions as they arrive.
            node.on.data('done', function(msg) {
                this.totalContr += msg.data.contribution;
            });
        }
    });

    stager.extendStep('results', {
        cb: function() {
            var previousStep, sortedContribs, total;

            // Get previous contributions
            previousStep = node.game.getPreviousStep();
            // Get all contribution in previous step.
            sortedContribs = node.game.memory.stage[previousStep]
            .selexec('contribution')
            // Sorting not needed now.
            // .sort(sortContributions)
            .fetch();

            // Multiply contributions.
            total = this.totalContr * settings.GROUP_ACCOUNT_MULTIPLIER;

            // Save to db, and sends results to players.
            finalizeRound(total, this.incomes, sortedContribs);
        }
    });

    stager.extendStep('end', {
        cb: function() {

            console.log('FINAL PAYOFF PER PLAYER');
            console.log('***********************');

            gameRoom.computeBonus({
                say: true,   // default false
                dump: true,  // default false
                print: true  // default false
            });

            // TODO: save email

            // Dump all memory.
            node.game.memory.save('memory_all.json');
        }
    });

    // Helper functions.

    // Saves results and sends to clients.
    function finalizeRound(total, incomes, sortedContribs) {
        var i, contribObj;
        var pid, payoff, client, distribution;

        distribution = total / sortedContribs.length;
        // Save the results for each player, and notify him/her.
        for ( i=0 ; i < sortedContribs.length; i++) {
            contribObj = sortedContribs[i];
            pid = contribObj.player;

            payoff = distribution + incomes[pid] - contribObj.contribution;

            // Store payoff in registry, so that gameRoom.computeBonus
            // can access it.
            client = channel.registry.getClient(pid);
            client.win += payoff;

            node.say('results', pid, {
                distribution: distribution,
                total: total,
                payoff: payoff
            });
        }
    }

    // If two contributions are exactly the same, then they are randomly ordered.
    function sortContributions(c1, c2) {
        if (c1.contribution > c2.contribution) return -1;
        if (c1.contribution < c2.contribution) return 1;
        if (Math.random() <= 0.5) return -1;
        return 1;
    }

};
