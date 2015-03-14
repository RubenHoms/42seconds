Template.gameGetReady.events({
    'click #nextRound': function() {
        // Disable the button so people won't call it again accidentally.
        $('#nextRound').attr('disabled', 'disabled');
        Meteor.call("startNextRound", Session.get("gamecode"), function( err ) {
            if( err ) {
                console.log("Error while trying to start new round:", err);
            }
        });
    }
});