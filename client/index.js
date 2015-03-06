/**
 * @author Ruben Homs <rubenhoms@gmail.com>
 * @since 06-11-2012
 * @version 0.1
 *
 * This file contains the startup methods and routines which Meteor has to go through
 * in order to startup good.
 *
 * Things like setting up a database should be done in this file.
 * Events and other template specific methods should be placed in their respective file.
 */
Meteor.startup(function () {
    /** Subscription functions */
    Meteor.subscribe("userStatus");
    Meteor.subscribe("games");
    Meteor.subscribe("dice");
    Meteor.subscribe("answers");
    /** /Subscription functions */

    /**
     * Everyone who connects will be made a user so we can
     * track them throughout the application by their _id
     */
    if(!Meteor.user()) {
        Accounts.createUser( { username: Random.id(), password: Random.id(), profile: { GameState: "NONE" } }, function( err ) {
            if( err ) {
                console.log( "Couldn't create user account, error:", err );
            }
        } );
    }

    Handlebars.registerHelper( "gameState", function() {
        var user = Meteor.user();
        if( user ) {
            var gameState = user.profile.GameState;

            // Check to make sure we don't accidentally rerun on change of game state
            if( gameState !== Session.get("gameState") ) {
                switch(gameState) {
                    // Base case, this is the initial value for the state.
                    case "NONE":
                        Session.set("gameState", "NONE");
                        break;
                    // Set when game is created.
                    case "GAME_CREATED":
                        Session.set("gameState", "GAME_CREATED");
                        console.log("Game created");
                        Router.go("showCode");
                        break;
                    // Set when user has to throw the dice
                    case "GAME_THROW_DICE":
                        Session.set("gameState", "GAME_THROW_DICE");
                        console.log("Time to throw the dice");
                        Router.go("gameDice");
                        break;
                    // Set when user is playing the game
                    case "GAME_PLAY":
                        Session.set("gameState", "GAME_PLAY");
                        Router.go("gameActiveTeam");
                        console.log("Playing game");
                        break;
                    // Set when user is waiting to play the game
                    case "GAME_PLAY_WAIT":
                        Session.set("gameState", "GAME_PLAY_WAIT");
                        Router.go("gameOpponent");
                        console.log("Other team playing game");
                        break;
                    // Set when user is checking the score
                    case "GAME_SCORE_CHECK":
                        Session.set("gameState", "GAME_SCORE_CHECK");
                        console.log("Checking score");
                        Router.go("gameScoreCheck");
                        break;
                    // Set when user is waiting for the score check
                    case "GAME_SCORE_CHECK_WAIT":
                        Session.set("gameState", "GAME_SCORE_CHECK_WAIT");
                        console.log("Waiting for other team to check the score");
                        Router.go("gameScoreCheckWait");
                        break;
                    // Set when user is viewing the game result screen
                    case "GAME_RESULT_OVERVIEW":
                        Session.set("gameState", "GAME_RESULT_OVERVIEW");
                        console.log("Score so far");
                        Router.go("gameResults");
                        break;
                    case "GAME_GET_READY":
                        Session.set("gameState", "GAME_GET_READY");
                        console.log("Get ready to play the next round");
                        Router.go("gameGetReady");
                        break;
                    // Set when the game is finished
                    case "GAME_FINISHED":
                        Session.set("gameState", "GAME_FINISHED");
                        console.log("Game is finished.");
                        Router.go("gameFinished");
                        break;
                }
            }

        }
    });
});
