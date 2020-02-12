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
        node.game.income= null;

        // Setup page: header + frame.
        header = W.generateHeader();
        W.generateFrame();

        // Add widgets.
        this.visualRound = node.widgets.append('VisualRound', header);
        this.visualTimer = node.widgets.append('VisualTimer', header);
        this.doneButton = node.widgets.append('DoneButton', header);

        this.displaySummaryPrevRound = function() {
            var save, groupReturn;
            // Shows previous round if round number is not 1.
            if ('number' !== typeof node.game.oldContrib) return;
            save = node.game.income - node.game.oldContrib;
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

    stager.extendStep('effort', {
        donebutton: false,
        frame: 'EffortTask.html',
        done: function() {
            return { effort: node.game.correct };
        },
        exit: function() {
            node.game.zero.destroy();
            node.game.zero = null;
        },
        cb: function() {
            var box = W.gid('box');
            // variable to count correct answer
            var correct = 0;
            node.game.correct = correct;
            //this is how to skip 1 stage in the game
            if (node.game.settings.treatmentName === 'Treatment_3') {
                //skip effort task
                node.done();
                return;
            }

            //show effort task
            // Number of numbers for each line
            var n = 5;
            // Number of lines
            var m = 4;
            // Initialize count of zeros
            var zeros = 0;
            function genrand(n,m) {
                box.innerHTML = '';
                zeros = 0;
                // Build a multidimensional array
                for (var i = 0; i < m; i++) {
                    // Generate random sequence
                    var rand = Array(n).fill().map(() => Math.floor(Math.random()*2));
                    // Add div
                    var myDiv = document.createElement("div");
                    // Add the sequence to div
                    myDiv.innerHTML = rand.join(' ');
                    // Display sequence
                    box.appendChild(myDiv);
                    // number of zeros
                    for (var j = 0; j < n; j++) {
                        if (rand[j] === 0) {
                            zeros += 1;
                        }
                    }
                }

                if (!node.game.zero) {
                    node.game.zero = node.widgets.append('CustomInput', 'above', {
                        id: 'zero',
                        mainText: 'How many zeros are there?',
                        type: 'int',
                        min: 0,
                        max: 50,
                        requiredChoice: true
                    });
                }
                else {
                    node.game.zero.reset();
                }
            }

            genrand(n,m);

            var button;
            button = W.gid('submitAnswer');
            button.onclick = function() {
                var count = node.game.zero.getValues().value;
                var message1;
                var message2;
                if (count === zeros) {
                    message1 = 'The answer is correct.';
                    node.game.correct += 1;
                    message2='So far, you had '+ node.game.correct+ ' correct tables';
                }
                else {
                    message1 = 'The answer is wrong.';
                    message2='So far, you had '+ node.game.correct+ ' correct tables';
                }
//                alert(message);
                // Hide element with id above.
                // Show element with id results.
                // Set innerHTML property of element with id textresult to
                // the value correct or wrong and how many table done so far.

                // hint: W.show and W.hide
                W.hide('above');
                W.show('results');
                W.setInnerHTML('CheckAnswer', message1);
                W.setInnerHTML('TotalPoint', message2);
                genrand(n,m);
            };

            var button2;
            button2 = W.gid('nextTable');
            button2.onclick = function() {
                // Hide element with id results.
                // Show element with id above.
            W.hide('results');
            W.show('above');
            };
        },

    });

    stager.extendStep('bid', {
        frame: settings.bidderPage,
        cb: function() {

            // Show summary previous round.
            node.game.displaySummaryPrevRound();

            node.game.bidInput = node.widgets.append('CustomInput', "input-td", {
                type: 'int',
                min: 0,
                max: 20,
                requiredChoice: true
            });

            node.on.data('income', function(msg) {
                W.setInnerHTML('bid_income', msg.data);
                node.game.income = msg.data;
            });
        },
        timeup: function() {
            var contribution = node.game.oldContrib;
            if ('undefined' === typeof contribution) {
                contribution = J.randomInt(-1, 20);
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
                var save = node.game.income - node.game.oldContrib;
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
                        id: 'mobility',
                        choices: [ 'Low', 'High', 'No opinion'],
                        requiredChoice: true,
                        title: false,
                        mainText: 'Based on incomes you obtained throughout 4 rounds, how do you perceive income mobility of your group?'
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
                className: 'centered',
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
