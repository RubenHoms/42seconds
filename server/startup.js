/**
 * @author Ruben Homs <rubenhoms@gmail.com>
 * @since 11/6/12
 * @version 0.1
 *
 * This file contains the logic which is needed on startup
 * such as setting timers and loading stuff.
 */

/**
 * Startup functions which will be executed when the server
 * has compiled and loaded all the files necessary.
 */
Meteor.startup(function () {
    // Set an event watcher for users disconnecting.
    UserStatus.events.on("connectionLogout", function(fields) {
        var user = Meteor.users.findOne(fields.userId);
        if ( user ) {
            Meteor.users.remove(fields.userId);
        }
    });

    // Load config files
    YamlConfig.loadFiles(Assets);
    config = YamlConfig.getServerConfig();

    config.dev ? config = config.devEnv : config = config.liveEnv;

    // Clear all the answers to make room for the new ones
    var json = JSON.parse(Assets.getText("items.json"));
    for(var i=0;i < json.length; i++) {
        if(Answers.findOne({'answer': json[i].answer})) {
            continue;
        }
        // No answer like this found. Insert into the collection.
        Answers.insert(json[i]);
    }
});
