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

/**
 * Get the teams playing in this game.
 * @return {Array}  The teams.
 */
Template.gameResults.teams = function () {
    return Teams.find({'gamecode':Session.get('gamecode')},{fields:{_id:true, name:true, score:true}}).fetch();
};

/**
 * Gets the answers belonging to this round.
 * @return {Array}  The answers
 */
Template.gameResults.answers = function () {
    var game = Games.findOne({'gamecode' : Session.get('gamecode')});
    if(game) {
        return game.answers;
    }
};

/**
 * Gets your team
 * @return {Object} Your team
 */
Template.gameResults.myTeam = function () {
    var team = Teams.findOne(Session.get('team_id'));
    if(team) {
        return team;
    }
};

Template.gameResults.teamRedScore = function () {
    var teams = Teams.find({'gamecode': Session.get('gamecode')}).fetch();
    if(teams) {
        for(var i = 0; i < teams.length; i++) {
            if(teams[i].name == "Team Red") {
                return teams[i].score;
            }
        }
    }
};

Template.gameResults.teamBlueScore = function () {
    var teams = Teams.find({'gamecode': Session.get('gamecode')}).fetch();
    if(teams) {
        for(var i = 0; i < teams.length; i++) {
            if(teams[i].name == "Team Blue") {
                return teams[i].score;
            }
        }
    }
};

/**
 * Gets the other team
 * @return {Object} The other team
 */
Template.gameResults.otherTeam = function () {
    var teams = Teams.find({'gamecode': Session.get('gamecode')}).fetch();
    var myTeam = Teams.findOne(Session.get('team_id'));
    if(teams && myTeam) {
        for(var i=0; i<teams.length; i++) {
            if(teams[i]._id !== myTeam._id) {
                return teams[i];
            }
        }
    }
};

Template.gameResults.ready = function () {
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
};

Template.gameResults.roundScores = function () {
    var game = Games.findOne({'gamecode': Session.get('gamecode')});
    if(game) {
        return game.roundScores;
    }
};

Template.gameResults.hasWinner = function() {
    var game = Games.findOne({'gamecode': Session.get('gamecode')});
    return game && game.winner;
};

Template.gameResults.winner = function() {
    var game = Games.findOne({'gamecode': Session.get('gamecode')});
    if(game) {
        return game.winner;
    }
}

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