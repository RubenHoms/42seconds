/**
 * @author Ruben Homs <rubenhoms@gmail.com>
 * @since 11/6/12
 * @version 0.1
 *
 * This file is here to put the event handlers, helpers and methods in
 * which belong to the gameResults template.
 *
 * This template serves as the page where the user will see their score after playing one round.
 * Here they are also able to continue to the new round and see who's turn it is.
 */
Template.gameResults.helpers({
    /**
     * Get the teams playing in this game.
     * @return {Array}  The teams.
     */
    teams: function() {
        return Teams.find({'gamecode':Session.get('gamecode')},{fields:{_id:true, name:true, score:true}}).fetch();
    },

    /**
     * Get the score of team red
     * @returns {Number} The score of team read
     */
    teamRedScore: function() {
        var teams = Teams.find({'gamecode': Session.get('gamecode')}).fetch();
        if(teams) {
            for(var i = 0; i < teams.length; i++) {
                if(teams[i].name == "Team Red") {
                    return teams[i].score;
                }
            }
        }
    },

    /**
     * Get the score of team blue
     * @returns {Number} The score of team blue
     */
    teamBlueScore: function() {
        var teams = Teams.find({'gamecode': Session.get('gamecode')}).fetch();
        if(teams) {
            for(var i = 0; i < teams.length; i++) {
                if(teams[i].name == "Team Blue") {
                    return teams[i].score;
                }
            }
        }
    },

    ready: function() {
        var game = Games.findOne({'gamecode' : Session.get('gamecode')});
        if(game.nextRound) {
            console.log("New round started!");
            // Render the game opponent template
            if(game.team._id === Session.get('team_id')) {
                Meteor.call("resetNextRound", Session.get("gamecode"), function(err, res) {
                    if(err) {
                        console.log("Error while reseting next round:", err);
                    }
                    Router.go("gameDice");
                });
            } else {
                Meteor.call("resetNextRound", Session.get("gamecode"), function(err, res) {
                    if(err) {
                        console.log("Error while reseting next round:", err);
                    }
                    Router.go("gameOpponent");
                });
            }
        }
    },

    /**
     * Gets the scores of all the rounds played.
     * @returns {Array} The scores.
     */
    roundScores: function() {
        var game = Games.findOne({'gamecode': Session.get('gamecode')});
        if(game) {
            return game.roundScores;
        }
    },

    /**
     * Does the game have a winner?
     * @returns {Boolean} Is there a winner?
     */
    hasWinner: function() {
        var game = Games.findOne({'gamecode': Session.get('gamecode')});
        return game && game.winner;
    },

    /**
     * Gets the winner of the game
     * @returns {String} The winner of the game.
     */
    winner: function() {
        var game = Games.findOne({'gamecode': Session.get('gamecode')});
        if(game) {
            return game.winner;
        }
    }
});

/**
 * Events for the gameResults template
 */
Template.gameResults.events({
    /**
     * Event: Click on the 'Done!' button.
     * This will start a new round.
     */
    'click .scoreok': function () {
        var game = Games.findOne({'gamecode': Session.get('gamecode')});
        // Check if we're not in conflicted state
        if(game.nextRound) {
            return;
        }

        if(game.round === game.rounds) {
            // The game is over.
            var teams = Teams.find({'gamecode':Session.get('gamecode')}).fetch();
            var teamOne = teams[0];
            var teamTwo = teams[1];
            var winner;
            if(teamOne.score > teamTwo.score) {
                winner = teamOne;
            }
            if(teamOne.score === teamTwo.score) {
                winner = 'tie';
            }
            if(teamTwo.score > teamOne.score) {
                winner = teamTwo;
            }

            Meteor.call("declareWinner", Session.get("gamecode"), winner, function(err,res) {
                if(err) {
                    console.log("Error while declaring winner:", err);
                } else {
                    Router.go("scoreboard");
                }
            });
        }

        console.log("Starting new round");
        if(game.team._id === Session.get('team_id')) {
            Meteor.call('newRound', Session.get('gamecode'), function () {
                Router.go("gameOpponent");
            });
        } else {
            Meteor.call('newRound', Session.get('gamecode'), function () {
                Router.go("gameDice");
            });
        }
    },
    'click #retry': function() {
        Router.go("/");
    }
});