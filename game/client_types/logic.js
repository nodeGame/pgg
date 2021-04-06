/**
* # Logic code for Meritocracy Game
* Copyright(c) 2017 Stefano Balietti
* MIT Licensed
*
* http://www.nodegame.org
* ---
*/

const path = require('path');
const fs   = require('fs-extra');

const ngc = require('nodegame-client');
const J = ngc.JSUS;


module.exports = function(treatmentName, settings, stager, setup, gameRoom) {

    const channel = gameRoom.channel;
    const node = gameRoom.node;
    const groupSize = gameRoom.game.waitroom.GROUP_SIZE;
    const memory = node.game.memory;

    stager.setDefaultProperty('minPlayers', [ groupSize ]);

    // Event handler registered in the init function are always valid.
    stager.setOnInit(function() {



    });

    // Extends Stages and Steps where needed.

    stager.extendStep('bid', {
        init: function() {
            // Counter for total contributions in this round.
            this.totalContr = 0;
            // Keep tracks of results sent to players in case of disconnections.
            this.contribs = {};
        },
        cb: function() {

            // Sort them
            // var sorted = node.game.efforts.sort(sortContributions);
            //
            //
            // var currentStage = node.game.getCurrentGameStage();
            // var previousStage = node.game.plot.previous(currentStage);
            //
            // var receivedData = memory.stage[previousStage]
            //                    .selexec('contribution');
            //
            // // If a player submitted twice with reconnections.
            //
            // var i, len, o = {}, c, newSize = 0;
            // i = -1, len = receivedData.db.length;
            // for ( ; ++i < len ; ) {
            //     c = receivedData.db[i];
            //     if (!o[c.player]) {
            //         ++newSize;
            //     }
            //     o[c.player] = c;
            // }
            // if (newSize !== receivedData.length) {
            //     var newDb = [];
            //     for ( i in o ) {
            //         if (o.hasOwnProperty(i)) {
            //             newDb.push(o[i]);
            //         }
            //     }
            //     receivedData = new ngc.GameDB();
            //     receivedData.importDB(newDb);
            // }
            //
            // // If a player submitted twice with reconnections.
            //
            // sorted = receivedData
            //     .sort(sortContributions)
            //     .fetch();
            //
            //
            // var pid, income;
            // for (var i = 0; i < sorted.length; i++) {
            //
            //     pid = sorted[i].id;
            //     node.say('income', pid, income);
            //     this.contribs[pid] = income;
            // }

            // Keep count of total contributions as they arrive.
            node.on.data('done', function(msg) {
                console.log(msg);
                this.contribs[msg.from] = msg.data.contribution;
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
            sortedContribs = memory.stage[previousStep]
            .selexec('contribution')
            .sort(sortContributions)
            .fetch();

            // Multiply contributions.
            total = this.totalContr * settings.GROUP_ACCOUNT_MULTIPLIER;

            // Save to db, and sends results to players.
            finalizeRound(total, this.contribs, sortedContribs);
        }
    });

    stager.extendStep('end', {
        cb: function() {

            console.log('FINAL PAYOFF PER PLAYER');
            console.log('***********************');

            gameRoom.computeBonus({
                say: true,
                dump: true,
                print: true
            });

            // Dump all memory.
            memory.save('memory_all.json');
        }
    });

    // Helper functions.

    // Saves results and sends to clients.
    function finalizeRound(total, contribs, sortedContribs) {
        var i, contribObj;
        var pid, payoff, client, distribution;

        distribution = total / sortedContribs.length;
        // Save the results for each player, and notify him/her.
        for ( i=0 ; i < sortedContribs.length; i++) {
            contribObj = sortedContribs[i];
            pid = contribObj.player;

            payoff = distribution + contribs[pid] - contribObj.contribution;

            // Store payoff in registry, so that gameRoom.computeBonus
            // can access it.
            client = channel.registry.getClient(pid);
            client.win += payoff;

            console.log({
                distribution: distribution,
                total: total,
                payoff: payoff
            })

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
