/**
 * # Functions used by the client of Ultimatum Game
 * Copyright(c) 2019 Stefano Balietti
 * MIT Licensed
 *
 * http://www.nodegame.org
 */

module.exports = {
    init: init
};

function init() {
    var that, header;

    that = this;
    this.node.log('Init.');

    // Setup the header (by default on the left side).
    if (!W.getHeader()) {
        header = W.generateHeader();

        // Uncomment to visualize the name of the stages.
        //node.game.visualStage = node.widgets.append('VisualStage', header);

        node.game.visualRound = node.widgets.append('VisualRound', header, {
            stageOffset: 1,
            title: false
        });

        node.game.visualTimer = node.widgets.append('VisualTimer', header);

        // Done button to click.
        node.game.donebutton = node.widgets.append('DoneButton', header);

        // Additional debug information while developing the game.
        // node.game.debugInfo = node.widgets.append('DebugInfo', header)
    }

    // Add the main frame where the pages will be loaded.
    if (!W.getFrame()) W.generateFrame();

    // Add event listeners valid for the whole game.

//    node.on('RESPONSE_DONE', function(response) {

        // Tell the other player own response.
//        node.say(response, node.game.partner, response);

        //////////////////////////////////////////////
        // nodeGame hint:
        //
        // node.done() communicates to the server that
        // the player has completed the current state.
        //
        // The parameters are send to the server with
        // a SET message. This SET message has two
        // properties by default:
        //
        // - time: time passed since the begin of the step
        // - timeup: if a timeup happened
        //
        // which can be overwritten by the parameter.
        //
        // Any number of additional properties can
        // be added and will be stored in the server.
        //
        /////////////////////////////////////////////
//        node.done({
//            value: node.game.income,
//            responseTo: node.game.partner,
//            response: response
//        });
//    });

    // Add other functions are variables used during the game.

//    this.resTimeup = function() {
//        var root, accepted;
//        accepted = Math.round(Math.random());
//        console.log('randomaccept');
//        root = W.getElementById('container');
//        if (accepted) {
//            node.emit('RESPONSE_DONE', 'ACCEPT');
//            W.write(' You accepted the offer.', root);
//        }
//        else {
//            node.emit('RESPONSE_DONE', 'REJECT');
//            W.write(' You rejected the offer.', root);
//        }
//    };

    // Quiz widget (to be created later).
    this.quiz = null;

    this.quizTexts = {

        howMuchMainText: 'How many coins do you get every of the 4 rounds?',
        howMuchChoices: [
            '20',
            '40',
            '20 or 40',
            'Other/not clear from instructions'
        ],

        rejectMainText: 'If you have 20 coins, you put 10 in your personal account and 10 in the group account, and all others do the same, what is your payoff from this round?',
        rejectChoices: [
            '30',
            '10',
            '20',
            'Other/not clear from instructions'
        ],

        disconnectMainText: 'If you have 40 coins, you put 20 in your personal account and 20 in the group account, and all others do not put any coins in the group account, what is your payoff from this round?',
        disconnectChoices: [
            '0',
            '10',
            '25',
            'Other/not clear from instructions'
        ]

    };

    // Questionnaire widget (to be created later).
    this.quest = null;

    this.questTexts = {
        mainText: 'If the game was terminated because of a ' +
            'player disconnection, in your opinion, why did the other player ' +
            'disconnect?',
        choices: [
            'He or she was losing.',
            'Technical failure.',
            'The player found a more rewarding task.',
            'The game was boring, not clear, too long, etc.',
            'Not applicable.'
        ],
        freeText: 'Please report any additional comment to the ' +
            'experimenters.'
    };

    // Set default language prefix.
    W.setUriPrefix(node.player.lang.path);

//    node.game.offerReceived = null;
}