/**
 * @author Ruben Homs <rubenhoms@gmail.com>
 * @since 11/6/12
 * @version 0.1
 *
 * Here you will find the helper functions which are
 * supposed to help the developer to create standard logic
 * which is not related to the network topology.
 */


Meteor.helpers = {
	/**
	 * This function will recursively create a 3 digit gamecode.
	 * @todo            Make this function delete already existing but idle games and take their codes.
	 * @return {Number} The gamecode.
	 */
	createGameCode: function() {
		var gamecode = '';
		var random;
		for (i = 0; i < 3; i++) {
			if (i == 0) {
				// don't allow 0 as first digit
				random = Math.floor(Math.random() * (9 - 1 + 1)) + 1;
			} else {
				random = Math.floor(Math.random() * (9 - 0 + 1));
			}
			gamecode += '' + random;
		}
		var found = Games.findOne({'gamecode':gamecode});
		if (found) {
			return Meteor.helpers.createGamecode();
		}
		return gamecode;
	},

	/**
	 * This function will load the answers into a specific game.
	 * @param gamecode  The game to load the answers in.
	 */
	loadAnswers: function(gamecode) {
		var game = Games.findOne({'gamecode':gamecode});

		if(typeof game.checkDuplicates!='undefined') {
			var checkDuplicates = JSON.parse(game.checkDuplicates);
		} else {
			var checkDuplicates = [];
		}

		var answers = [];
		var filters = {};
console.log(game);
		for(var i=0; i<config.defaultNumberOfAnswers; i++) {

			if(game.difficulty=='Medium') {
				if(game.category=='All' || !game.category) {
					// do nothing
				} else {
					filters.category = game.category;
				}
			}
			if(game.language != 'All') {
				filters.langauge = game.language;
			}

			var words = Answers.find(filters);
			var words = words.fetch();
			var random = Math.floor(Math.random() * (words.length - 1)) + 0; // we need to add the zero!!11!!1!

			var answer = words[random];
			if( answer ) {
				if(checkDuplicates.indexOf(answer.answer)==-1) {
					checkDuplicates.push(answer.answer);
					answers.push({"answer":answer.answer});
				} else {
					i=i-1;
				}
			}
		}

		var checkDupesSerialized = JSON.stringify(checkDuplicates);
		Games.update({'gamecode':gamecode}, {$set:{'answers':answers,'checkDuplicates':checkDupesSerialized}});
	},

	/**
	 * Change the game state for a single users
	 * @param userId 	{String}	The user to change the gamestate for
	 * @param gameState {String}	The gamestate to set it to
	 */
	changeGameState: function( userId, gameState ) {
		Meteor.users.update( userId, { $set: { profile: { "GameState": gameState } } } );
	},

	/**
	 * This function will take an object with the user id as key
	 * and game state as value and change the game states on each
	 * of the user objects.
	 * @param userGameStates {Object}	The game states of the users
	 */
	changeUserGameStates: function( userGameStates ) {
		_.each( userGameStates, function( gameState, userId) {
			Meteor.helpers.changeGameState( userId, gameState );
		});
	},

	/**
	 * This function advances the game state for a specific user.
	 * This will redirect a user to the next template.
	 * @param userId {String}	The user to advance the game for
	 */
	advanceGameState: function( userId ) {
		var user = Meteor.users.findOne( userId );
		var nextGameState;
		if( user ) {
			switch( user.profile.GameState ) {
				// Base case, this is the initial value for the state.
				case "NONE":
					break;
				// Set when game is created.
				case "GAME_CREATED":
					nextGameState = "GAME_THROW_DICE";
					break;
				// Set when user has to throw the dice
				case "GAME_THROW_DICE":
					nextGameState = "GAME_PLAY";
					break;
				// Set when user is playing the game
				case "GAME_PLAY":
					nextGameState = "GAME_SCORE_CHECK_WAIT";
					break;
				// Set when user is waiting to play the game
				case "GAME_PLAY_WAIT":
					nextGameState = "GAME_SCORE_CHECK";
					break;
				// Set when user is checking the score
				case "GAME_SCORE_CHECK":
					nextGameState = "GAME_GET_READY";
					break;
				// Set when user is waiting for the score check
				case "GAME_SCORE_CHECK_WAIT":
					nextGameState = "GAME_RESULT_OVERVIEW";
					break;
				// Set when user is viewing the game result screen
				case "GAME_RESULT_OVERVIEW":
					nextGameState = "GAME_PLAY_WAIT";
					break;
				// Set when user is getting ready for next round
				case "GAME_GET_READY":
					nextGameState = "GAME_THROW_DICE";
					break;
				// Set when the game is finished
				case "GAME_FINISHED":
					nextGameState = "GAME_FINISHED";
					break;
			}
			Meteor.helpers.changeGameState( userId, nextGameState );
		}
	},

	/**
	 * This function will advance the game for both players
	 * inside it.
	 * @param game {Games}	The game to advance.
	 */
	advanceGame: function( game ) {
		if( game ) {
			_.each( game.users, function( userId ) {
				Meteor.helpers.advanceGameState( userId );
			});
		}
	},

	/**
	 * This function will advance the game given a gamecode
	 * @param {String}	gamecode	The gamecode of the game to advance.
	 */
	advanceGameByGamecode: function( gamecode ) {
		var game = Games.findOne( { 'gamecode': gamecode } );
		if( game ) {
			Meteor.helpers.advanceGame( game );
		}
	},

	/**
	 * This function will finish the game.
	 * @param {String}	gamecode	The gamecode for the game to finish.
	 */
	finishGame: function( gamecode ) {
		var game = Games.findOne( { 'gamecode': gamecode } );
		if( game ) {
			_.each( game.users, function( userId) {
				Meteor.helpers.changeGameState( userId, "GAME_FINISHED");
			});
			Games.update( { 'gamecode':gamecode }, { $set:{ 'finished': true } } );
		}
	}
};
