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

    REPEAT: 2,

    // Minimum number of players that must be always connected.
    MIN_PLAYERS: 4,

    // Payment settings. *
    //MPCR
    GROUP_ACCOUNT_MULTIPLIER: 2,

    // Divider ECU / DOLLARS *
    EXCHANGE_RATE: 0.01,

    // Number of coins each round.
    COINS: 20,

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
        pgg: {
            description: 'Public Good Game',
            instrPage: 'instructions_high_merit_based.html',
            quizPage: 'quiz_exo_perfect.html'
        }

    }

};
