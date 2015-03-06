/**
 * @author Ruben Homs <rubenhoms@gmail.com>
 * @since 11/6/12
 * @version 0.1
 *
 * This file is here to put the event handlers, helpers and methods in
 * which belong to the gameOpponent template.
 *
 * This template is used for the gameOpponent to see and hold track of the number of answers the other team
 * has guessed. It will only see the answers that the other party has guessed and checked off.
 */
Template.gameOpponent.helpers({
    /**
     * Get the answers that are checked off (considered correct by the other team).
     * @return {Array}  The checked off answers
     */
    checkedOff: function() {
        var game = Games.findOne({'gamecode' : Session.get('gamecode')});
        var answers = [];
        if(!game.answers || !game || !game.answers.length) {
            return 0;
        }
        for(var i=0; i<game.answers.length; i++) {
            if(game.answers[i].checkedOff) {
                answers.push(game.answers[i]);
            }
        }
        return answers;
    },

    /**
     * Gets the number of the current round.
     * @return {Number} The current round
     */
    roundnumber: function() {
        var game = Games.findOne({'gamecode' : Session.get('gamecode')});
        if(game) {
            return game.round;
        }
    },

    /**
     * Get the score of the current game.
     * @return {Number} The score.
     */
    score: function() {
        var team = Teams.findOne(Session.get('team_id'));
        if(team) {
            return team.score;
        }
    }
});

Template.gameOpponent.rendered = function() {
    // Run the CSS timer animation ToDo: Run when dice is thrown
    $('.pointer').addClass('run');
    $('div.countdown').addClass('run');
};

