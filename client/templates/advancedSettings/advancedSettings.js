/**
 * @author Ruben Homs <rubenhoms@gmail.com>
 * @since 11/6/12
 * @version 0.1
 *
 * This file is here to put the event handlers, helpers and methods in
 * which belong to the advancedSettings template.
 *
 * This templated serves as a place for players to set the advanced settings such as difficulty, rounds and
 * other stuff for a new game.
 */
Template.advancedSettings.helpers({
    categories: function() {
        return ['All','Willekeurig','Nerdy','Films','Acteurs','Sporten','Landen','Televisie','Steden','Magento'];
    },

    difficulties: function() {
        return [{'name': 'Super easy'},{'name':'Easy'},{'name':'Medium','selected':true},{'name':'Hard'},{'name':'Power extreme'}];
    }
});

/**
 * Events for the advancedSettings template
 */
Template.advancedSettings.events({
    /**
     * Event: Click on the 'start game' button
     */
    'click input#startgame':function () {
        var rounds = $('select[name="rounds"]').val()*1;
        var category = $('select[name="category"]').val();
        var difficulty = "Medium";
        var language = $('select[name="language"]').val();
        var dice = $('select[name="dice"]').val();

        // Start a new game
        Meteor.call('startNewGame', Meteor.userId(), rounds, category, difficulty, language, dice, function (error, game) {
            Session.set('gamecode',game.gamecode);
        });
    },
    
	'click img.backbutton' : function () {
        Router.go("newGame");
    }
});
