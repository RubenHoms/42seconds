Template.gameDice.events({
    'click input.dice':function () {
        if (!Session.get('gamecode')) {
            console.log("gamecode not set");
            return;
        }
        if (Dice.findOne({'access_code':Session.get('gamecode')})) {
            Dice.update({'access_code':Session.get('gamecode')}, {$set:{'throw':Math.floor(Math.random() * 3)}});
        } else {
            Dice.insert({'access_code':Session.get('gamecode'), 'throw':Math.floor(Math.random() * 3)});
        }
    }
});

Template.gameDice.diceThrow = function () {
    return Dice.findOne({'access_code':Session.get('gamecode')});
}

var team = function () {
    return Teams.findOne(Session.get('team_id'));
};

var game = function () {
    var me = team();
    return me && me.gamecode && Games.findOne(me.gamecode);
};

Template.lobby.events({
    'click input.newgame':function () {
        Meteor.call('newgame', function (error, result) {
            $("body").html(Meteor.render(Template.newgame));
        });
    },
    'click input.joingame':function () {
        $("body").html(Meteor.render(Template.join));
    }
});

Template.newgame.events({
    'click input.startgame':function () {
        Meteor.call('start_new_game', function (error, gamecode) {
            Template.showcode.gamecode = gamecode;
            var fragment = Meteor.render(Template.showcode);
            $("body").html(fragment);
        });
    },
    'click input.advancedsettings':function () {
        Meteor.call('advancedsettings', function (error, gamecode) {
            $("body").html(Meteor.render(Template.advancedsettings));
        });
    }
});

Template.advancedsettings.events({
    'click input.startgame':function () {
        rounds = $('input[name="rounds"]').val();
        category = $('input[name="category"]').val();
        difficulty = $('input[name="difficulty"]').val();

        Meteor.call('start_new_game', rounds, category, difficulty, function (error, gamecode) {
            Template.showcode.rounds = rounds;
            Template.showcode.rounds = category;
            Template.showcode.rounds = difficulty;
            Template.showcode.gamecode = gamecode;
            var fragment = Meteor.render(Template.showcode);
            $("body").html(fragment);
        });
    }
});

Template.join.events({
    'click input.joingame':function () {
        gamecode = $("#gamecode").val();
        Meteor.call('joined_game', gamecode, function (error, result) {
            if (error) {
                console.log(error);
                return;
            }
            $("body").html(Meteor.render(Template.joined));
        });
    }
});

Template.joined.ready = function () {
    var game = Games.findOne({'gamecode':Session.get('gameid')});
    if (game) {
        if (game.players.length >= 2) {
            $("body").html(Meteor.render(Template.gameDice));
        }
    }
}

Template.showcode.ready = function () {
    var game = Games.findOne({'gamecode':Session.get('gameid')});
    if (game) {
        if (game.players.length >= 2) {
            $("body").html(Meteor.render(Template.gameDice));
        }
    }
}

Meteor.startup(function () {
    // Allocate a new team id.
    //
    // XXX this does not handle hot reload. In the reload case,
    // Session.get('team_id') will return a real id. We should check for
    // a pre-existing team, and if it exists, make sure the server still
    // knows about us.
    var team_id = Teams.insert({name:'', idle:false});
    Session.set('team_id', team_id);

    // subscribe to all the teams, the game i'm in, and all
    // the words in that game.
    Meteor.autosubscribe(function () {
        Meteor.subscribe('teams');

        if (Session.get('team_id')) {
            var me = team();
            if (me && me.gamecode) {
                Meteor.subscribe('games', me.gamecode);
                Session.set('gamecode', me.gamecode);
            }
        }
    });
});
