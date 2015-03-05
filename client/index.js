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
    /**
     * Allocate a new team id. This will be the id which determines the score and respective their turn.
     * @param {String} error    The error if it is set.
     * @param {String} team_id  The _id of the team object just created.
     */
    Meteor.call('createTeam', function(error, team_id) {
        Session.set('team_id', team_id);
    });

    /** Subscription functions */
    Meteor.subscribe("userStatus");
    Meteor.subscribe("games");
    Meteor.subscribe("teams");
    Meteor.subscribe("dice");
    Meteor.subscribe("answers");
    /** /Subscription functions */

    if(!Meteor.user()) {
        Accounts.createUser( { username: Random.id(), password: Random.id() }, function( err ) {
            if( err ) {
                console.log( "Couldn't create user account, error:", err );
            }
        } );
    }
});
