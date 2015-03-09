Template.gameFinished.helpers({
    /**
     * This function returns all the scores for each round.
     * It also adds an 'index' property which we can use as
     * a round number.
     * @returns {Array} The scores.
     */
    roundScores: function() {
        var game = Games.findOne( { 'gamecode': Session.get("gamecode") } );
        if( game ) {
            // Add an 'index' property so we can use it as round number.
            var roundScores = [];
            _.each(game.roundScores, function(object, index) {
                roundScores.push(_.extend(object, { index: index+1 }));
            });
            return roundScores;
        }
    },

    /**
     * This function checks if the score given is from the red team.
     * @param {Number} score    The score of the user
     * @param {String} user     The userId of the user who got the score.
     * @returns {Number}        Either 0 if the score is not from team red or the score if it is.
     */
    scoreRed: function( score, user ) {
        var game = Games.findOne( { 'gamecode': Session.get("gamecode") } );
        if( game ) {
            /**
             * Check if the user is the red user (which is always
             * the first user in the game.users array
             */
            if( user == game.users[0] ) {
                // Score is from the red user
                return score
            } else {
                return 0;
            }
        }
    },

    /**
     * This function checks if the score given is from the blue team.
     * @param {Number} score    The score of the user
     * @param {String} user     The userId of the user who got the score.
     * @returns {Number}        Either 0 if the score is not from team blue or the score if it is.
     */
    scoreBlue: function( score, user ) {
        var game = Games.findOne( { 'gamecode': Session.get("gamecode") } );
        if( game ) {
            /**
             * Check if the user is the blue user (which is always
             * the first user in the game.users array
             */
            if( user == game.users[1] ) {
                // Score is from the blue user
                return score
            } else {
                return 0;
            }
        }
    },

    /**
     * This function returns the total score of team red.
     */
    teamRedTotal: function() {
        var game = Games.findOne( { 'gamecode': Session.get("gamecode") } );
        if( game ) {
            var teamRed = game.users[0],
                totalScore = 0;
            _.each( game.roundScores, function( roundScore ) {
                roundScore.user == teamRed ? totalScore += roundScore.score : null;
            });
            return totalScore;
        }
    },

    /**
     * This function returns the total score of team blue.
     */
    teamBlueTotal: function() {
        var game = Games.findOne( { 'gamecode': Session.get("gamecode") } );
        if( game ) {
            var teamBlue = game.users[1],
                totalScore = 0;
            _.each( game.roundScores, function( roundScore ) {
                roundScore.user == teamBlue ? totalScore += roundScore.score : null;
            });
            return totalScore;
        }
    },

    /**
     * Template helper which determines if the user won the game.
     * @returns {boolean}   Did I win?
     */
    iWon: function() {
        var teamBlueTotal = Template.gameFinished.__helpers[" teamBlueTotal"](),
            teamRedTotal = Template.gameFinished.__helpers[" teamRedTotal"](),
            game = Games.findOne( { 'gamecode': Session.get("gamecode") } );

        if( game ) {
            if( Meteor.userId() == game.users[0] ) {
                // I'm from team red
                return teamRedTotal > teamBlueTotal;
            }
            if( Meteor.userId() == game.users[1] ) {
                // I'm from team blue
                return teamBlueTotal > teamRedTotal;
            }
        }
    },

    /**
     * Checks if the game ended in a tie.
     * @returns {boolean}   Is it a tie?
     */
    isATie: function() {
        var teamBlueTotal = Template.gameFinished.__helpers[" teamBlueTotal"](),
            teamRedTotal = Template.gameFinished.__helpers[" teamRedTotal"]();
        return teamBlueTotal == teamRedTotal;
    }
});

Template.gameFinished.events({
    'click #retry': function() {
        window.location.href = window.location.origin;
    }
});