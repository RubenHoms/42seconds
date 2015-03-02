/**
 * @author Ruben Homs <rubenhoms@gmail.com>
 * @since 11/6/12
 * @version 0.1
 *
 * This file is here to put the event handlers, helpers and methods in
 * which belong to the newGame template.
 *
 * This template serves as a page on which users can select to start a quick match or
 * continue with advanced settings.
 */

/**
 * The events on the newGame template page
 */
Template.newGame.events({

    /**
     * Event: Click on the 'Quick Match' button.
     */
    'click input#startgame':function () {
        Meteor.call('startNewGame', Session.get('team_id'), function (error, game) {
            Template.showCode.team = game.teams.length;
            Session.set('teamNumber',game.teams.length);
            Session.set('gamecode', game.gamecode);
            Template.showCode.gamecode = game.gamecode;
            Router.go("showCode");
        });
    },

    /**
     * Event: Click on the 'Advanced Settings' button.
     */
    'click input#advancedSettings':function () {
        Meteor.call('advancedSettings', function (error, gamecode) {
            Router.go("advancedSettings");
        });
    },

    /**
     * Event: Click on the back button.
     */
    'click img.backbutton' : function () {
        Router.go("/");
    }
});