/**
 * # Game setup
 * Copyright(c) 2017 Stefano Balietti
 * MIT Licensed
 *
 * This file includes settings that are shared amongst all client types
 *
 * http://www.nodegame.org
 * ---
 */

module.exports = function(settings, stages) {

    var setup = {};

    setup.debug = true;

    setup.verbosity = 1;

    setup.window = {
        promptOnleave: !setup.debug
    };

    return setup;
};
