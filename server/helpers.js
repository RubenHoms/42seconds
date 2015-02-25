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
			var checkDuplicates = new Array();
		}

		var answers = new Array();
		var data = new Array();

		for(var i=0; i<config.defaultNumberOfAnswers; i++) {
			var answersWithGuessedPercentage = Answers.find().count() - Answers.find({'guess_percentage':null}).count();

			if(game.difficulty=='medium' || answersWithGuessedPercentage < 250) {
				if(game.category=='all' || typeof game.category == 'undefined' || game.category === null) {
					var words = Answers.find();
				} else {
					var words = Answers.find({'category':game.category});
				}
			} else {
				if(game.difficulty == 'Super easy') {
					lowerbound = 0.9;
					upperbound = 1;
				} else if(game.difficulty == 'Easy') {
					lowerbound = 0.75;
					upperbound = 1;
				} else if(game.difficulty == 'Hard') {
					lowerbound = 0.25;
					upperbound = 0.5;
				} else if(game.difficulty == 'Power extreme') {
					lowerbound = 0;
					upperbound = 0.25;
				}
				if(game.category=='all' || typeof game.category == 'undefined' || game.category === null) {
					var words = Answers.find({'guess_percentage':{'$lte':upperbound,'$gte':lowerbound}}).fetch();
				} else {
					var words = Answers.find({'guess_percentage':{'$lte':upperbound,'$gte':lowerbound},'category':game.category}).fetch();
				}
			}

			random = Math.floor(Math.random() * (words.count() - 0 + 1)) + 0; // we need to add the zero!!11!!1!
			var words = words.fetch();

			var answer = words[random];

			if(typeof answer!='undefined') {
				if(checkDuplicates.indexOf(answer.answer)==-1) {
					checkDuplicates.push(answer.answer);
					answers.push({"answer":answer.answer});
					if(typeof answer.shown == 'undefined') {
						shown = 0;
					} else {
						shown = answer.shown;
					}
					if(typeof answer.guessed == 'undefined') {
						var guessed = 0;
					} else {
						var guessed = answer.guessed;
					}
					var newShown = (shown*1)+1;
					Answers.update({'_id':answer._id}, {$set:{'shown':newShown,'guess_percentage':(newShown/guessed)}});
				} else {
					i=i-1;
				}
			}
		}

		var checkDupesSerialized = JSON.stringify(checkDuplicates);
		Games.update({'gamecode':gamecode}, {$set:{'answers':answers,'checkDuplicates':checkDupesSerialized}});
	}
};