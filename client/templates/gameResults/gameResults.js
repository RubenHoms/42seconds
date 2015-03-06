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
    'roundScore': function() {
        var game = Games.findOne( {'gamecode': Session.get('gamecode') } );
        if( game ) {
            return _.last( game.roundScores).score;
        }
    },

    roundHandicap: function() {
        var game = Games.findOne( {'gamecode': Session.get('gamecode') } );
        if( game ) {
            return _.last( game.roundHandicaps).handicap;
        }
    },

    roundScoreWithoutHandicap: function() {
        var game = Games.findOne( {'gamecode': Session.get('gamecode') } );
        if( game ) {
            return _.last( game.roundScores).score + _.last( game.roundHandicaps).handicap;
        }
    }
});