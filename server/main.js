/**
 * @author Ruben Homs <rubenhoms@gmail.com>
 * @since 11/6/12
 * @version 0.1
 *
 * The main server side methods and logic.
 */

/**
 * Meteor methods the client can call as follows:
 * Meteor.call('nameOfFunction', arg1, arg2, etc.., callback)
 */
Meteor.methods({
    /**
     * Returns the string 'newGame' to let the client know what game type to pick (quick match)
     * @return {String} newGame
     */
    newGame:function () {
        return 'newGame';
    },

    /**
     * Returns the string 'rules' to let the client know what page to load (rules)
     * @return {String} rules
     */
    rules:function () {
        return 'rules';
    },

    /**
     * Starts a new game, loads the answers, sets the clock and returns the game.
     * @param userId        The user which started the game
     * @param rounds        Number of rounds
     * @param category      The category to play
     * @param difficulty    The difficulty to play on
     * @param language	    The language the items should be selected from
     * @param dice	    Whether or not to use the dice to decide on handicap
     * @return {Games}      The game that was just created.
     */
    startNewGame:function (userId, rounds, category, difficulty, language, dice) {
        var clock;
        if(typeof rounds=='undefined') {
            rounds = config.defaultRounds;
        }
        if(typeof category=='undefined') {
            category = config.defaultCategory;
        }

        if(typeof difficulty=='undefined') {
            difficulty = config.defaultDifficulty;
        }
        if(typeof clock=='undefined') {
            clock = config.defaultClock;
        }

        if(typeof language=='undefined') {
            language = config.defaultLanguage;
        }

        if(typeof dice=='undefined') {
            dice = config.defaultDice;
        }

        var gamecode = Meteor.helpers.createGameCode();

        // create a new game with the current team in it
        Games.insert({'clock':clock, 'rounds': rounds, 'category': category, 'difficulty': difficulty,
            'gamecode':gamecode, 'round':1, 'users': [userId], roundScores: [], roundHandicaps: [], 'language':language, 'dice':dice
        });


        Meteor.helpers.loadAnswers(gamecode);
        Meteor.helpers.changeGameState(userId, "GAME_CREATED");

        return Games.findOne({'gamecode':gamecode});
    },

    /**
     * Joins a game
     * @param {String} gamecode The game to join.
     * @param {String} userId   The user which wants to join
     * @return {Games}          The game he just joined.
     */
    joinGame:function (gamecode, userId) {
        Games.update( { 'gamecode': gamecode }, { $push: { users: userId } } );
        var game = Games.findOne( { 'gamecode': gamecode } );
        var userGameStates = {};
        if(game.dice == 0) {
            userGameStates[game.users[0]] = "GAME_PLAY";
            userGameStates[game.users[1]] = "GAME_PLAY_WAIT";

            Meteor.call("startClock", gamecode, game.users[0] );
        } else {
            userGameStates[game.users[0]] = "GAME_THROW_DICE";
            userGameStates[game.users[1]] = "GAME_PLAY_WAIT";
        }
        Meteor.helpers.changeUserGameStates(userGameStates);

        return Games.findOne({'gamecode':gamecode});
    },

    /**
     * Starts the clock
     * @param {String} gamecode  The game to start the clock on.
     * @param {String} userId    The user that initiated the clock start
     */
    startClock: function(gamecode, userId ) {
        // Set the clock to the default clock
        Games.update({gamecode:gamecode}, {$set:{clock:config.defaultClock}});
        var clock = config.defaultClock;

        // Set the game states for the playing users
        var game = Games.findOne({ 'gamecode': gamecode } );
        Meteor.helpers.advanceGameState( userId );

        // wind down the game clock
        var interval = Meteor.setInterval(function () {
            clock -= 1;
            Games.update({gamecode:gamecode}, {$set:{clock:clock}});

            // end of game
            if (clock === 0) {
                Games.update({gamecode:gamecode}, {$set:{clock:0}});
                // stop the clock
                Meteor.clearInterval(interval);
                var game = Games.findOne({'gamecode':gamecode});
                Meteor.helpers.advanceGame( game );
            }
        }, 1000);
    },

    /**
     * Starts a new round.
     * @param {String} gamecode The game to start a new round on
     */
    startNextRound: function(gamecode) {
        // First, check if this was the last round to see if we need to finish the game
        var game = Games.findOne( { "gamecode": gamecode } );
        if( game ) {
            if( game.round >= game.rounds ) {
                Meteor.helpers.finishGame( gamecode );
                return;
            }
        }

        // Load a new set of answers
        Meteor.helpers.loadAnswers(gamecode);

        // Check whether the game uses a dice and react accordingly.
        if( game.dice == 0 ) {
            _.each( game.users, function( userId ) {
                var user = Meteor.users.findOne( userId );
                if( user ) {
                    if( user.profile.GameState == "GAME_RESULT_OVERVIEW" ) {
                        // User is going to wait the next round
                        Meteor.helpers.changeGameState( userId, "GAME_PLAY_WAIT" );
                    } else {
                        // Start the clock and then advance the game again
                        // this is because the startClock function also advances the state
                        // to the gameDice template of the person who's going to play,
                        // so we need to advance it to the gameActiveTeam template again.
                        Meteor.call( "startClock", gamecode, user._id, function() {
                            Meteor.helpers.advanceGameState( user._id );
                        } );
                    }
                }
            });
        } else {
            // Game uses a dice, advance the game like normal.
            Meteor.helpers.advanceGameByGamecode(gamecode);
        }
        Games.update( { 'gamecode': gamecode }, { $inc: { round: 1 } } );
    },

    /**
     * This function will add an entry to the round handicap
     * array. In this array the dice throw of a user is stored
     * as follows:
     * [
     *   {
     *     user: userId,
     *     handicap: 0-2
     *   }
     *   , ...
     * }
     *
     * The indexes of the array correspond to the round played.
     * So index = 0 means round 1.
     * @param {String} gamecode The game to set the handicap on.
     * @param {String} userId   The userId of the user throwing the dice.
     * @param {Number} handicap 0-2
     */
    setRoundHandicap: function(gamecode, userId, handicap) {
        var game = Games.findOne( { 'gamecode': gamecode });
        if( game ) {
            Games.update( {'gamecode': gamecode }, { $push: { 'roundHandicaps': { user: userId, handicap: handicap } } } );
        }
    },

    /**
     * This function will update the answers on a current game. Used
     * for checking off answers.
     * @param {String} gamecode The game to edit the answers on.
     * @param {Array} answers   The answers which will replace the previous ones.
     */
    updateAnswers: function(gamecode, answers) {
        Games.update({'gamecode':gamecode},{$set:{'answers':answers}});
    },

    /**
     * Confirms the score of the current round.
     * @param {String}  gamecode    The gamecode of the game.
     * @param {Number}  score       The score
     * @param {String}  userId      The userId of the user checking, so NOT the user who scored it.
     */
    confirmScore: function( gamecode, score, userId ) {
        var game = Games.findOne( { 'gamecode': gamecode } );
        var correctUserId;
        if( game ) {
            for( var i = 0; i < game.users.length; i++) {
                if( userId == game.users[i] ) {
                    continue;
                }  else {
                    correctUserId = game.users[i];
                }
            }
        }

        var scores = {
            user: correctUserId,
            score: score
        };

        Games.update({'gamecode': gamecode}, {'$push': { 'roundScores': scores} } );
        Meteor.helpers.advanceGameByGamecode( gamecode );
    }
});

/** Publish functions */
// User status for tracking it on the front-end
Meteor.publish("userStatus", function() {
    return Meteor.users.find({ "status.online": true });
});

Meteor.publish("games", function() {
    return Games.find();
});

Meteor.publish("answers", function() {
    return Answers.find();
});
/** /Publish functions */
