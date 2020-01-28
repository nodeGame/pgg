/**
/**
 * # Player code for Meritocracy Game
 * Copyright(c) 2017 Stefano Balietti
 * MIT Licensed
 *
 * http://www.nodegame.org
 * ---
 */

module.exports = function(treatmentName, settings, stager, setup, gameRoom) {
    
    // Variable here are available to all stages.
    stager.setDefaultGlobals({
        // Total number of players in group.
        totPlayers: gameRoom.game.waitroom.GROUP_SIZE,

    });

    stager.setOnInit(function() {
        var header, frame;
        var COINS; // we do not need this information in our game
        console.log('INIT PLAYER!');


        COINS = node.game.settings.INITIAL_COINS;// we do not need this information in our game

        node.game.oldContrib = null;
        node.game.oldDemand = null;
        node.game.oldPayoff = null;
        node.game.income= null;

        // Setup page: header + frame.
        header = W.generateHeader();
        frame = W.generateFrame();

        // Add widgets.
        this.visualRound = node.widgets.append('VisualRound', header, {
            title: false
        });
        this.visualTimer = node.widgets.append('VisualTimer', header);
        this.doneButton = node.widgets.append('DoneButton', header);

        // Check if treatment is Endo.
        this.isEndo = function () {
            return node.game.settings.treatmentName === "endo";
        };

        // Valid Bid and Demand.
        this.isValidDemand = this.isValidContribution = function(n) {
            return false !== JSUS.isInt(n, 0, node.game.income);
        };

        // Takes in input the results of _checkInputs_ and correct eventual
        // mistakes. If in the first round a random value is chosen, otherwise
        // the previous decision is repeated. It also updates the screen.
        this.correctInputs = function(checkResults) {
            var contrib, demand;
            var errorC, errorD;

            if (checkResults.success) {
                contrib = parseInt(W.getElementById('contribution').value, 10);

                if (node.game.isEndo()) {
                    demand = parseInt(W.getElementById('demand').value, 10);
                }
            }
            else {

                if (checkResults.errContrib) {

                    if ('number' !== typeof node.game.oldContrib) {
                        contrib = JSUS.randomInt(-1, 20);
                    }
                    else {
                        contrib = node.game.oldContrib;
                    }
                    errorC = document.createElement('p');
                    errorC.innerHTML = 'Your contribution was set to ' +contrib;
                    W.getElementById('divErrors').appendChild(errorC);
                    W.getElementById('contribution').value = contrib;
                }

                // In ENDO we check the demand too.
                if (checkResults.errDemand) {

                    if ('number' !== typeof node.game.oldDemand) {
                        demand = JSUS.randomInt(-1, 20);
                    }
                    else {
                        demand = node.game.oldDemand;
                    }
                    errorD = document.createElement('p');
                    errorD.innerHTML = 'Your demand was set to ' + demand;
                    W.getElementById('divErrors').appendChild(errorD);
                    W.getElementById('demand').value = demand;
                }
            }

            return {
                contribution: contrib,
                demand: demand
            };
        };

        // Retrieves and checks the current input for contribution, and for
        // demand (if requested). Returns an object with the results of the
        // validation. It also displays a message in case errors are found.
        this.checkInputs = function() {
            var contrib, demand;
            var divErrors, errorC, errorD;

            divErrors = W.getElementById('divErrors');

            // Clear previous errors.
            divErrors.innerHTML = '';

            // Always check the contribution.
            contrib = W.getElementById('contribution').value;

            if (!node.game.isValidContribution(contrib)) {
                errorC = document.createElement('p');
                errorC.innerHTML = 'Invalid contribution. ' +
                    'Please enter a number between 0 and ' + node.game.income;
                divErrors.appendChild(errorC);
            }

            // In ENDO we check the demand too.
            if (node.game.isEndo()) {

                demand = W.getElementById('demand').value;

                if (!node.game.isValidDemand(demand)) {
                    errorD = document.createElement('p');
                    errorD.innerHTML = 'Invalid demand. ' +
                        'Please enter a number between 0 and ' + node.game.income;
                    divErrors.appendChild(errorD);
                }
            }

            return {
                success: !(errorC || errorD),
                errContrib: !!errorC,
                errDemand: !!errorD
            };
        };

        this.updateResults = function (barsValues) {
            var group, player, i, j, div, subdiv, color, save;
            var barsDiv, showDemand;
            var text, groupHeader, groupHeaderText, groupNames;
            var payoffSpan, bars;

            groupNames = node.game.settings.GROUP_NAMES;

            showDemand = node.game.isEndo();

            console.log(barsValues);
            console.log(showDemand);

            barsDiv = W.getElementById('barsResults');
            payoffSpan = W.getElementById('payoff');

            barsDiv.innerHTML = '';

            bars = W.getFrameWindow().bars;

            for (i = 0; i < barsValues[0].length; i++) {
                group = barsValues[0][i];
                div = document.createElement('div');
                div.classList.add('groupContainer');
                groupHeader = document.createElement('h4');
                groupHeaderText = 'Group ' + groupNames[i];
                if (showDemand) {
                    groupHeaderText += barsValues[3][i] ? ' (' : ' (not ';
                    groupHeaderText += 'compatible)';
                }

            }

            node.game.oldPayoff = +barsValues[2]; // final payoff

                // How many coins player put in personal account.
            save = node.game.income - node.game.oldContrib;
            payoffSpan.innerHTML = save + ' + ' + (barsValues[2] - save) +
                    ' = ' + node.game.oldPayoff;
        };

        this.displaySummaryPrevRound = function () {
            var save, groupReturn;

                // Shows previous round if round number is not 1.
            if ('number' === typeof node.game.oldContrib) {

                save = node.game.income - node.game.oldContrib;
                groupReturn = node.game.oldPayoff -save;

                W.getElementById('previous-round-info').style.display = 'block';

                    // Updates display for current round.
                W.setInnerHTML('yourPB', save);
                W.setInnerHTML('yourOldContrib', node.game.oldContrib);
                W.setInnerHTML('yourReturn', groupReturn);
                W.setInnerHTML('yourPayoff', node.game.oldPayoff);

                if (node.game.isEndo()) {
                    W.setInnerHTML('yourOldDemand', node.game.oldDemand);
                }
            }
        };

        node.on('SOCKET_DISCONNECT', function () {
                // Disabled.
            return;
            alert('Connection with the server was terminated. If you think ' +
                    'this is an error, please try to refresh the page. You can ' +
                    'also look for a HIT called ETH Descil Trouble Ticket for ' +
                    'nodeGame and file an error report. Thank you for your ' +
                    'collaboration.');
        });

    });
	//});

    // STAGES and STEPS.

    stager.extendStep('instructions', {
        frame: settings.instrPage,
        cb: function() {
            var n, s;
            s = node.game.settings;
            n = node.game.globals.totPlayers;
            W.setInnerHTML('players-count', n);
            W.setInnerHTML('players-count-minus-1', (n-1));
            W.setInnerHTML('rounds-count', s.REPEAT);
            console.log('Instructions');
        }
    });



    stager.extendStep('quiz', {
        frame: 'quiz_exo_perfect.html',
        widget: {
            name: 'ChoiceManager',
            root: 'root',
            options: {
                id: 'quiz_exo_perfect',
                title: false,
                forms: [
                {
                    name: 'ChoiceTable',
                    id: 'coinsEveryRound',
                    choices: ['20', '40', '20 or 40', 'Other/not clear from instructions'],
                    correctChoice: 2,
                    shuffleChoices: true,
//                    requiredChoice: true,
//                    title: false,
                    mainText: 'How many coins do you get every of the 4 rounds?',
//
                },
                {
                    name: 'ChoiceTable',
                    id: 'lowestPayment',
                    choices: ['30', '10', '20', 'Other/not clear from instructions'],
                    correctChoice: 2,
                    shuffleChoices: true,
//                    requiredChoice: true,
//                    title: false,
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
//                    requiredChoice: true,
//                    title: false,
                },
                ]
            }
        }

    });









//    stager.extendStep('quiz', {
//        frame: 'quiz_exo_perfect.html',
//    });


	stager.extendStep('effort', {
		frame: 'EffortTask.html',
		done: function() {
			var effortresult = 'Correct answers: ' + node.game.correct;
//			alert(effortresult);
			var effort = { effort: node.game.correct};
			return effort;
		},
		cb: function() {
			var above = W.getElementById ('above');
			// variable to count correct answer
			var correct = 0;
			node.game.correct = correct;
			//this is how to skip 1 stage in the game
            if (node.game.settings.treatmentName==='Treatment_3'){
                //skip effort task
                node.done();
                return;
            }
            //show effort task
			// Number of numbers for each line
			var n = 10;
			// Number of lines
			var m = 5;
			// Initialize count of zeros
  			var zeros = 0;
			function genrand(n,m) {
				above.innerHTML = '';
				zeros = 0;
  				// Build a multidimensional array
  				for (var i = 0; i < m; i++) {
  					// Generate random sequence
  					var rand = Array(n).fill().map(() => Math.floor(Math.random()*2));
  					// Add div
  					var myDiv = document.createElement("div");
  					// Add the sequence to div
  					myDiv.innerHTML = rand;
  					// Display sequence
  					above.appendChild(myDiv);
  					// number of zeros
  					for (var j = 0; j < n; j++) {
  						if (rand[j] === 0) {
  							zeros += 1;
  						}
  					}
				};

				node.game.zero = node.widgets.append('CustomInput', 'above', {
				id: 'zero',
				mainText: 'How many zeros are there?',
				type: 'int',
				min: 0,
				max: 50,
				requiredChoice: true
				});

			}

			genrand(n,m);

			var button;
			button = W.getElementById('submitAnswer');


			button.onclick = function() {
				var count = node.game.zero.getValues().value;
				if(count === zeros){
				var message = 'Correct';
				node.game.correct += 1;
				alert(message);
				}
				else{
				var message = 'Wrong';
				alert(message);
				}
				genrand(n,m);
			};
		},

	});




    stager.extendStep('bid', {
        frame: settings.bidderPage,
        cb: function() {


            // Show summary previous round.

////////////////////////////////
            // Show summary previous round.
            node.game.displaySummaryPrevRound();

            // Clear previous errors.
            W.setInnerHTML('divErrors', '');

            // Clear contribution and demand inputs.
            W.getElementById('contribution').value = '';
            if (node.game.isEndo()) W.getElementById('demand').value = '';

            console.log('Meritocracy: bid page.');
			node.on.data('income', function(msg) {
				var message = 'Your income is ' + msg.data;

				var income;
				W.setInnerHTML('bid_income', msg.data);
                node.game.income=msg.data; //new code
				//alert(message);
				node.done();
			});
        },
        done: function() {
            var validation, bid;
            validation = node.game.checkInputs();
            // Do not go forward if it is not timeup and validation failed.
            if (!node.game.timer.isTimeup() && !validation.success) {
                return false;
            }
            bid = node.game.correctInputs(validation);
            // Store reference for next round.
            node.game.oldContrib = bid.contribution;
            node.game.oldDemand = bid.demand;
            // Send it to server.
            return bid;
        }
    });




    stager.extendStep('results', {
        frame: settings.resultsPage,
        cb: function () {
            node.on.data('results', function(msg) {
                var treatment, barsValues;

                console.log('Received results.');

                barsValues = msg.data;
                treatment = node.env('roomType');

                if (treatment === 'endo') {
                    W.setInnerHTML('yourOldDemand', node.game.oldDemand);
                }

                this.updateResults(barsValues);
            });
        }
    });



  stager.extendStep('questionnaire', {
        frame: 'postgame.htm',
        widget: {
            name: 'ChoiceManager',
            root: 'root',
            options: {
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
        frame: 'ended.html',
        widget: {
            name: 'EndScreen',
            root: 'root',
            options: {
                panel: false,
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
