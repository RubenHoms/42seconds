/**
 * @author Ruben Homs <rubenhoms@gmail.com>
 * @since 11/6/12
 * @version 0.1
 *
 * This file is here to put the event handlers, helpers and methods in
 * which belong to the gameDice template.
 *
 * This template serves as the page where the user throws the dice to see what his handicap is.
 */

/**
 * This function sets the handicap of the player
 * @param {Number} handicap  The handicap (int of 0-2)
 */
var set_handicap = function(handicap) {
    Meteor.call("setRoundHandicap", Session.get("gamecode"), Meteor.userId(), handicap, function(err, res) {
        if(err) {
            console.log("Error while setting handicap:", err);
            return;
        }
        // Set a timeout so people have time to actually see what they threw
        Meteor.setTimeout(function() {
            Meteor.call('startClock', Session.get('gamecode'), Meteor.userId(), function (err, res) {
                if(err) {
                    console.log("Error while starting clock:", err);
                }
            });
        }, 1500);
    });
};

function throwDice() {
    $('input#dice').attr('disabled', 'disabled');
    var number_of_dices = $('#dices').children().length;
    var max_animations = 50;
    var lastindex = max_animations;
    var handicap = 0;
    for(var i = 0; i < max_animations; i++) {
        Meteor.setTimeout(function() {
            handicap = (handicap + Math.floor(Math.random() * (number_of_dices - 1)) + 1) % number_of_dices;
            $('#dices div:visible').hide();
            $($('#dices').children().get(handicap)).show();
            lastindex--;
            if(lastindex == 0) {
                set_handicap(handicap);
            }
        }, i * 50);
    }
}

Template.gameDice.events({
    'click input#dice':function () {
		throwDice();
    }
});