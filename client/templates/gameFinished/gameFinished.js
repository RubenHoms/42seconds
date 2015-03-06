Template.gameFinished.helpers({
    /**
     * Team red is always the first to join, so
     * you can just look up the first array entry of the
     * game.users object
     */
    roundScores: function() {
        var game = Games.findOne( { 'gamecode': Session.get("gamecode") } );
        if( game ) {
            var roundScores = [];
            _.each(game.roundScores, function(object, index) {
                roundScores.push(_.extend(object, { index: index+1 }));
            });
            console.log(roundScores);
            return roundScores;
        }
    },

    scoreRed: function( score, user ) {
        var myId = Meteor.userId();
        if( user == myId) {
            // I'm the red user
            return score
        } else {
            return 0;
        }
    },

    scoreBlue: function( score, user ) {
        var myId = Meteor.userId();
        if( user == myId) {
            // I'm the blue user
            return score
        } else {
            return 0;
        }
    }

});

function teamRed() {
    var game = Games.findOne( { 'gamecode': Session.get("gamecode") } );
    if( game ) {
        return game.users[0]
    }
}