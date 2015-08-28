var express = require('express'),
  mongoose = require('mongoose'),
  fs = require('fs'),
  config = require('./config/config')
;

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

var checkSetup = function() {

  var User = mongoose.model('User');

  //If there isn't a user setup, prompt for one
  User.findOne({}, function(err, result) {

    if(!result) {
      var defaultUser = new User({
        username: config.defaultUser
      });

      User.register(defaultUser, config.defaultPassword, function (err) {
        if(err) {
          throw err;
        }
        console.log("User: " + defaultUser.username + " registered.");
      });
    }

  });

};

var startApp = function() {

  var app = express();

  app.engine('html', require('ejs').renderFile);

  require('./config/middleware')(app, config);
  require('./config/routes')(app);

  var Indexer = require('./indexing/indexer');

  Indexer.startTimer();

  app.enable('trust proxy', 1);
  app.disable('e-tag');

  app.listen(config.port);
  console.log('Listening on port: ' + config.port);
};


checkSetup();
startApp();
