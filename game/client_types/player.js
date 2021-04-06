/**
/**
* # Player code for Social Mobility Game
* Copyright(c) 2020 Stefano Balietti
* MIT Licensed
*
* http://www.nodegame.org
* ---
*/

module.exports = function(treatmentName, settings, stager, setup, gameRoom) {

    stager.setOnInit(function() {
        var header;

        console.log('INIT PLAYER!');

        node.game.oldContrib = null;
        node.game.oldPayoff = null;

        // Setup page: header + frame.
        header = W.generateHeader();
        W.generateFrame();

        // Add widgets.
        this.visualRound = node.widgets.append('VisualRound', header);
        this.visualTimer = node.widgets.append('VisualTimer', header);
        this.doneButton = node.widgets.append('DoneButton', header);


        // This function is called to create the bars.
        this.showBars = function(barsValues) {
            var group, player, i, j, div, subdiv, color;
            var barsDiv;
            var text, groupHeader, groupHeaderText, groupNames;
            var bars;

            // Notice: _barsValues_ array:
            // 0: array: contr, demand
            // 1: array: group, position in group
            // 2: payoff

            console.log(barsValues);

            barsDiv = W.getElementById('barsResults');

            barsDiv.innerHTML = '';

            bars = W.getFrameWindow().bars;

            for (i = 0; i < barsValues[0].length; i++) {
                group = barsValues[0][i];
                div = document.createElement('div');
                div.classList.add('groupContainer');
                groupHeader = document.createElement('h4');
                groupHeaderText = 'Group ' + groupNames[i];

                groupHeader.innerHTML = groupHeaderText;
                barsDiv.appendChild(div);
                div.appendChild(groupHeader);

                for (j = 0; j < group.length; j++) {

                    player = group[j];

                    // It is me?
                    if (barsValues[1][0] === i && barsValues[1][1] === j) {
                        color = [undefined, '#9932CC'];
                        text = ' YOU <img src="imgs/arrow.jpg" ' +
                            'style="height:15px;"/>';
                    }
                    else {
                        color = ['#DEB887', '#A52A2A'];
                        text = '';
                    }

                    // This is the DIV actually containing the bar
                    subdiv = document.createElement('div');
                    div.appendChild(subdiv);
                    bars.createBar(subdiv, player[0], 20, color[0], text);

                }
            }
        };

        this.displaySummaryPrevRound = function() {
            var save, groupReturn;
            // Shows previous round if round number is not 1.
            if ('number' !== typeof node.game.oldContrib) return;
            save = node.game.contrib - node.game.oldContrib;
            groupReturn = node.game.oldPayoff - save;

            W.show('previous-round-info');
            // Updates display for current round.
            W.setInnerHTML('yourPB', save);
            W.setInnerHTML('yourOldContrib', node.game.oldContrib);
            W.setInnerHTML('yourReturn', groupReturn);
            W.setInnerHTML('yourPayoff', node.game.oldPayoff);
        };
    });


    // STAGES and STEPS.

    stager.extendStep('instructions', {
        frame: settings.instrPage
    });

    stager.extendStep('quiz', {
        frame: 'quiz_exo_perfect.html',
        widget: {
            name: 'ChoiceManager',
            root: 'root',
            options: {
                id: 'quiz',
                title: false,
                className: 'centered',
                forms: [
                    {
                        name: 'ChoiceTable',
                        id: 'coinsEveryRound',
                        choices: ['20', '40', '20 or 40', 'Other/not clear from instructions'],
                        correctChoice: 2,
                        shuffleChoices: true,
                        mainText: 'How many coins do you get every of the 4 rounds?',
                        //
                    },
                    {
                        name: 'ChoiceTable',
                        id: 'lowestPayment',
                        choices: ['30', '10', '20', 'Other/not clear from instructions'],
                        correctChoice: 2,
                        shuffleChoices: true,
                        mainText: 'If you have 20 coins, you put 10 in your personal account and 10 in the group account, and all others do the same, what is your payoff from this round?',
                        //
                    },
                    {
                        name: 'ChoiceTable',
                        id: 'leastGuarantee',
                        mainText: 'If you have 40 coins, you put 20 in your personal account and 20 in the group account, and all others do not put any coins in the group account, what is your payoff from this round?',
                        choices: ['0', '10', '25', 'Other/not clear from instructions'],
                        correctChoice: 2,
                        shuffleChoices: true,
                    },
                ]
            }
        }

    });

    stager.extendStep('bid', {
        frame: settings.bidderPage,
        cb: function() {

            W.setInnerHTML('bid_contrib', node.game.settings.COINS);

            // Show summary previous round.
            node.game.displaySummaryPrevRound();
            node.game.bidInput = node.widgets.append('CustomInput', "input-td", {
                type: 'int',
                min: 0,
                max: node.game.settings.COINS,
                requiredChoice: true
            });


        },
        timeup: function() {
            var contribution = node.game.oldContrib;
            if ('undefined' === typeof contribution) {
                contribution = J.randomInt(-1, node.game.settings.COINS);
            }
            node.game.bidInput.setValues({
                // Random value if undefined.
                values: contribution
            });
            node.done();
        },
        done: function() {
            var bid = node.game.bidInput.getValues();
            if (!bid.isCorrect && !node.game.timer.isTimeup()) return false;
            // Store reference for next round.
            node.game.oldContrib = bid.value;
            // Send it to server.
            return { contribution: bid.value };
        }
    });

    stager.extendStep('results', {
        frame: settings.resultsPage,
        cb: function () {
            node.on.data('results', function(msg) {
                var payoff = msg.data.payoff;





                node.game.oldPayoff = payoff;

                // How many coins player put in personal account.
                var save = node.game.settings.COINS - node.game.oldContrib;
                var payoffSpan = W.gid('payoff');
                payoffSpan.innerHTML = save + ' + ' + (payoff - save) +
                ' = ' + node.game.oldPayoff;
            });
        }
    });

    stager.extendStep('questionnaire', {
        widget: {
            name: 'ChoiceManager',
            root: 'container',
            options: {
                className: 'centered',
                id: 'questionnaire',
                title: false,
                forms:  [
                    {
                        name: 'ChoiceTable',
                        id: 'gender',
                        choices: [ 'Male', 'Female', 'No opinion' ],
                        requiredChoice: true,
                        title: false,
                        mainText: 'What is your gender?'
                    },

                    {
                        name: 'ChoiceTable',
                        id: 'age',
                        choices: [ '<20 years old', '20-40 years old', '>40 years old'  ],
                        requiredChoice: true,
                        title: false,
                        mainText: 'How old are you?'
                    },

                    {
                        name: 'ChoiceTable',
                        id: 'study',
                        choices: [ 'Economics', 'Psychology', 'Others' ],
                        requiredChoice: true,
                        title: false,
                        mainText: 'What is your field of study?'
                    },

                    {
                        name: 'ChoiceTable',
                        id: 'alreadyParticipated',
                        choices: [ 'Yes', 'No' ],
                        requiredChoice: true,
                        title: false,
                        mainText: 'Have you ever participated in a similar ' +
                        'experiment before?'
                    },

                    {
                        name: 'ChoiceTable',
                        id: 'strategy',
                        choices: [
                            [ 'random', 'Randomly chose numbers' ],
                            [ 'egoist', 'Maximized my own monetary payoff' ],
                            [ 'inequality aversion', 'Minimized differences between your payoff and others\' payoffs'],
                            [ 'other', 'Other (please described below)' ]
                        ],
                        title: false,
                        orientation: 'v',
                        requiredChoice: true,
                        mainText: 'Describe the strategy you played:'
                    },
                ],
                freeText: 'Please leave any feedback for the experimenter'
            }
        }
    });

    stager.extendStep('end', {
        donebutton: false,
        widget: {
            name: 'EndScreen',
            root: 'container',
            options: {
                title: false,
                feedback: false,
                exitCode: false,
                email: {
                    texts: {
                        label: 'Enter your email (optional):'
                    }
                }
            }
        }
    });
};
