module.exports = function(app){

	//home route
	var index = require('../app/controllers/index'),
        twitch = require('../app/controllers/twitch')
	app.get('/', index.index);
    app.get('/refresh', index.refresh);
    app.get('/twitch/:channel', twitch.view);

};
