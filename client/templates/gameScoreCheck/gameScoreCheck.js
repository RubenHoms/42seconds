/**
 * @author Ruben Homs <rubenhoms@gmail.com>
 * @since 11/6/12
 * @version 0.1
 *
 * This file is here to put the event handlers, helpers and methods in
 * which belong to the gameScoreCheck template.
 *
 * This template serves as a page for the other team to add answers that weren't checked off
 * or were guessed wrong in the 42 seconds that the user could play. This screen is presented to the non-playing
 * team, the other team has to wait for them to confirm the score.
 */
Template.gameScoreCheck.helpers({
    /**
     * The answers which were asked in the game.
     * @return {Array}  The answers
     */
    answers: function() {
        var game = Games.findOne({'gamecode':Session.get('gamecode')});
        if (game) {
            return game.answers;
        }
    }
});

/**
 * Events for the gameScoreCheck template
 */
Template.gameScoreCheck.events({
    /**
     * Event: Click on the 'done!' button
     * Confirms the answers.
     */
    'click input.nextround': function () {
        // Disable the button to stop accidental double taps etc.
        $('#nextround').attr('disabled', 'disabled');
        var game = Games.findOne({'gamecode' : Session.get('gamecode')});

        var correctAnswers = _.filter( game.answers, function( answer ) {
            return answer.checkedOff;
        });

        var handicap = game.dice == 0 ? 0 : _.last(game.roundHandicaps).handicap;
        score = correctAnswers.length - handicap;

        Meteor.call("confirmScore", Session.get("gamecode"), score, Meteor.userId(), function(err, res) {
            if(err) {
                console.log("Error while confirming score:", err);
            }
        });
    },
    /**
     * Event: Click on the checkbox before an answer
     * Checks or unchecks the answer.
     */
    'click input': function () {
        var game = Games.findOne({'gamecode' : Session.get('gamecode')});
        var answers = game.answers;
        for(i=0;i<answers.length;i++) {
            if(answers[i].answer === this.answer && answers[i].checkedOff) {
                answers[i].checkedOff = false;
                continue;
            }
            if(answers[i].answer == this.answer) {
                answers[i].checkedOff = true;
                continue;
            }
            if(!answers[i].answer == this.answer && !answers[i].checkedOff) {
                answers[i].checkedOff = false;
                continue;
            }
        }
        // Update the game with the new set of answers.
        Meteor.call("updateAnswers", Session.get("gamecode"), answers, function(err, res) {
            if(err) {
                console.log("Error while updating answers:", err);
            }
        });
    }
});