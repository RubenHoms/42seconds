Template.gameGetReady.events({
    'click #nextRound': function() {
        Meteor.call("startNextRound", Session.get("gamecode"), function( err ) {
            if( err ) {
                console.log("Error while trying to start new round:", err);
            }
        });
    }
});