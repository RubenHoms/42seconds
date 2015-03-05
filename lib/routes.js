Router.configure({
    layoutTemplate: 'layout'
});

// Specific iron router routes
Router.route('/', function () {
    this.render('lobby');
});

Router.route('/advancedSettings', function () {
    this.render('advancedSettings');
});

Router.route('/gameActiveTeam', function () {
    this.render('gameActiveTeam');
});

Router.route('/gameDice', function () {
    this.render('gameDice');
});

Router.route('/gameOpponent', function () {
    this.render('gameOpponent');
});

Router.route('/gameResults', function () {
    this.render('gameResults');
});

Router.route('/gameScoreCheck', function () {
    this.render('gameScoreCheck');
});

Router.route('/gameScoreCheckWait', function () {
    this.render('gameScoreCheckWait');
});

Router.route('/join', function () {
    this.render('join');
});

Router.route('/newGame', function () {
    this.render('newGame');
});

Router.route('/rules', function () {
    this.render('rules');
});

Router.route('/showCode', function () {
    this.render('showCode');
});