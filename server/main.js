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
     * Create a team
     * @return {String} _id of the team which the user stores in the session variable 'team_id'
     */
    createTeam: function () {
        return Teams.insert({'name':'Team','score':0});
    },

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
     * @param team_id       The team which started the game
     * @param rounds        Number of rounds
     * @param category      The category to play
     * @param difficulty    The difficulty to play on
     * @return {Games}      The game that was just created.
     */
    startNewGame:function (team_id, rounds, category, difficulty) {
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

        var gamecode = Meteor.helpers.createGameCode();

        var team = Teams.findOne({_id:team_id});
        // create a new game with the current team in it
        Games.insert({'team':team, 'clock':clock, 'rounds': rounds, 'category': category, 'difficulty': difficulty, 'gamecode':gamecode, 'round':1, 'scoreConfirmed':false, 'nextRound': false});

        // Save a record of who is in the game, so when they leave we can
        // still show them.
        Teams.update({_id: team_id}, {$set:{'gamecode':gamecode, 'name': 'Team Red','score':0}});

        var p = Teams.find({'gamecode':gamecode},
            {fields:{_id:true, name:true}}).fetch();

        Meteor.helpers.loadAnswers(gamecode);

        Games.update({'gamecode':gamecode}, {$set:{'teams':p}});

        return Games.findOne({'gamecode':gamecode});
    },

    /**
     * Joins a game
     * @param {String} gamecode The game to join.
     * @param {String} team_id  The team which wants to join
     * @return {Game}           The game he just joined.
     */
    joinedGame:function (gamecode,team_id) {
        var game = Games.findOne({'gamecode':gamecode});
        var teamNumber = (game.teams.length*1)+1;
        Teams.update({_id:team_id},
            {$set:{'gamecode':gamecode,'name':'Team Blue'}},
            {multi:true});
        // Save a record of who is in the game, so when they leave we can
        // still show them.
        var p = Teams.find({'gamecode':gamecode},
            {fields:{_id:true, name:true, score:true}}).fetch();
        Games.update({'gamecode':gamecode}, {$set:{teams:p}});
        return Games.findOne({'gamecode':gamecode});
    },

    /**
     * Starts the clock
     * @param {String} gamecode  The game to start the clock on.
     */
    startClock: function(gamecode) {
        // Set the clock to the default clock
        Games.update({gamecode:gamecode}, {$set:{clock:config.defaultClock}});
        var clock = config.defaultClock;
        var winner;

        // wind down the game clock
        var interval = Meteor.setInterval(function () {
            clock -= 1;
            Games.update({gamecode:gamecode}, {$set:{clock:clock}});

            if((clock % 5)==0) {
                // check every 5 seconds for an idle player
                var teams = Teams.find({'gamecode':gamecode},{fields:{_id:true, name:true, score:true}}).fetch();
                for(i=0;i<teams.length;i++) {
                    if(teams[i].idle) {
                        if(i==0) {
                            winner = teams[1];
                        } else if(i==1) {
                            winner = teams[0];
                        }
                        // Team IDLE! == forfeit
                        Games.update({'gamecode':gamecode},{$set:{'forfeited':true,'winner':winner}});
                    }
                }
            }
            // end of game
            if (clock === 0) {
                Games.update({gamecode:gamecode}, {$set:{clock:0}});
                // stop the clock
                Meteor.clearInterval(interval);
                var game = Games.findOne({'gamecode':gamecode});
                team = game.team;
                var teams = Teams.find({'gamecode':gamecode},{fields:{_id:true, name:true, score:true}}).fetch();
                for(i=0;i<teams.length;i++) {
                    if(teams[i]._id!=team._id) {
                        // set the other team as current team for the new game
                        Games.update({gamecode:gamecode}, {$set:{'team':team}});
                    }
                }

                if(game.round>=game.rounds) {
                    // game ENDS!
                    // declare zero or more winners
                    var teams = Teams.find({'gamecode':gamecode},{fields:{_id:true, name:true, score:true}}).fetch();
                    var highest = 0;
                    var winner = 'tie';
                    for(i=0;i<teams.length;i++) {
                        if(teams[i].score>highest) {
                            winner = teams[i].name;
                        } else if(teams[i].score==highest) {
                            winner = 'tie';
                        }
                    }
                    Games.update({'gamecode':gamecode},{$set: {'winner':winner}});
                }
            }
        }, 1000);
    },

    /**
     * Starts a new round.
     * @param gamecode  The game to start a new round on
     */
    newRound: function(gamecode) {
        // reset scoreConfirmed, winner & handicap
        var game = Games.findOne({'gamecode':gamecode});

        if(game.nextRound) {
            return "redirect";
        }

        // Set the new team to play
        var newTeam;
        if(game.team._id === game.teams[0]._id) {
            newTeam = game.teams[1];
        } else {
            newTeam = game.teams[0];
        }

        Games.update({'gamecode':gamecode},
            {$set:
                {
                    'winner':null,
                    'handicap':null,
                    'scoreConfirmed':false,
                    'team': newTeam,
                    'clock': config.defaultClock,
                    'round' : game.round+1,
                    'answers': null,
                    'nextRound': true
                }}
        );

        Meteor.helpers.loadAnswers(gamecode);
    },

    setRoundHandicap: function(gamecode, handicap) {
        if (Dice.findOne({'access_code':gamecode})) {
            Dice.update({'access_code':gamecode}, {$set:{'throw':handicap}});
            Games.update({'gamecode' : gamecode}, {'$set':{'handicap':handicap}});
        } else {
            Dice.insert({'access_code':gamecode, 'throw':handicap});
            Games.update({'gamecode' : gamecode}, {'$set':{'handicap':handicap}});
        }
    },

    updateAnswers: function(gamecode, answers) {
        Games.update({'gamecode':gamecode},{$set:{'answers':answers}});
    },

    confirmScore: function(gamecode, scores) {
        Games.update({'gamecode': gamecode}, {'$set': {'scoreConfirmed' : true, 'roundScores': scores}});
    },

    declareWinner: function(gamecode, winner) {
        Games.update({'gamecode': gamecode}, {'$set':{'winner':winner}});
    },

    resetNextRound: function(gamecode) {
        Games.update({'gamecode': gamecode}, {'$set':{'nextRound':false}});
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

Meteor.publish("teams", function() {
    return Teams.find();
});

Meteor.publish("dice", function() {
    return Dice.find();
});

Meteor.publish("answers", function() {
    return Answers.find();
});
/** /Publish functions */