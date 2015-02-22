var express = require('express'),
  mongoose = require('mongoose'),
  fs = require('fs'),
  config = require('./config/config');

mongoose.connect(config.db);
var db = mongoose.connection;
db.on('error', function () {
  throw new Error('unable to connect to database at ' + config.db);
});

var modelsPath = __dirname + '/models';
fs.readdirSync(modelsPath).forEach(function (file) {
  if (file.indexOf('.js') >= 0) {
    require(modelsPath + '/' + file);
  }
});

var User = mongoose.model('User');

var startApp = function() {
  var app = express();

  app.engine('html', require('ejs').renderFile);

  require('./config/middleware')(app, config);
  require('./config/routes')(app);

  var refresh = require('./indexing/main');

  refresh.TIMEOUT = setTimeout(refresh.refresh, refresh.POLL_INTERVAL);

  app.enable('trust proxy', 1);

  app.listen(config.port);
  console.log('Listening on port: ' + config.port);
};

//If there isn't a user setup, prompt for one
User.findOne({}, function(err, result) {
  if(!result) {
    var prompt = require('prompt');

    var properties = [
      {
        name: 'username',
        validator: /^[a-zA-Z\s\-]+$/,
        warning: 'Username must be only letters, spaces, or dashes'
      },
      {
        name: 'password',
        hidden: true
      }
    ];

    prompt.start();

    prompt.get(properties, function (err, result) {
      if (err) {
        throw err;
      }

      User.register(new User({
        username: result.username
      }), result.password, function (ev) {

        console.log("User: " + result.username + " registered.");

        startApp();

      });

    });

  } else {
    startApp();
  }

});
