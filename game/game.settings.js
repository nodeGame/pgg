/**
 * # Game settings definition file
 * Copyright(c) 2017 Stefano Balietti
 * MIT Licensed
 *
 * The variables in this file will be sent to each client and saved under:
 *
 *   `node.game.settings`
 *
 * The name of the chosen treatment will be added as:
 *
 *    `node.game.settings.treatmentName`
 *
 * http://www.nodegame.org
 * ---
 */

module.exports = {

    // Numnber of game rounds repetitions.

    REPEAT: 4,

    // Minimum number of players that must be always connected.
    MIN_PLAYERS: 4,
    GROUP_NAMES: ['1'],

    // How many player in each group. *
    SUBGROUP_SIZE: 4,
    // 2 subjects have high income
    N_HIGH: 2,
    // 2 subjects have low income
    N_LOW: 2,

    // Payment settings. *
    //MPCR
    GROUP_ACCOUNT_DIVIDER: 2,
    //high income
    HIGH:40,
    //low income
    LOW: 20,

    // Divider ECU / DOLLARS *
    EXCHANGE_RATE: 0.01,

    // WE DON'T USE THIS INFORMATION IN OUR TREATMENT
/////////////////////////
// Noise standard deviation. High and low "meritocracy".
    NOISE_HIGH: 1.4142,
    NOISE_LOW: 2,
    INITIAL_COINS: 20,
/////////////////////////

// setup time for each stage
    TIMER: {
        instructions: 90000,
        effort: 60000,
        quiz: 90000,
        bid: function() {
            var round;
            round = this.getCurrentGameStage().round;
            if (round < 3) return 30000;
            return 15000;
        },
        results: function() {
            var round;
            round = this.getCurrentGameStage().round;
            if (round < 2) return 60000;
            if (round < 3) return 50000;
            return 30000;
        },
        questionnaire: 45000
    },

    // Treatments definition.
    // Custom pages depending on treatment.
    bidderPage:  'bidder.html',
    resultsPage: 'results.html',

    treatments: {
        Treatment_1: {
            description: 'Merit-based and High mobility',
            instrPage: 'instructions_high_merit_based.html',
            quizPage: 'quiz_exo_perfect.html'
        },
        Treatment_3: {
            description: 'Non-merit-based + High mobility',
            instrPage: 'instructions_exo_perfect.html',
            quizPage: 'quiz_exo_perfect.html'
        },
//        Treatment_2: {
//            description: 'Merit-based and Low mobility',
//            instrPage: 'instructions_low_merit-based.html',
//            quizPage: 'quiz_exo_perfect.html'
//        }
//        Treatment_4: {
//            description: 'Non merit-based and Low mobility',
//            instrPage: 'instructions_low_non_merit-based.html',
//            quizPage: 'quiz_exo_perfect.html'
//        }


    }

};
