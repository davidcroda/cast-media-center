var express = require('express'),
  mongoose = require('mongoose'),
  fs = require('fs'),
  passport = require('passport'),
  config = require('./config/config');

mongoose.connect(config.db);
var db = mongoose.connection;
db.on('error', function () {
  throw new Error('unable to connect to database at ' + config.db);
});

var modelsPath = __dirname + '/app/models';
fs.readdirSync(modelsPath).forEach(function (file) {
  if (file.indexOf('.js') >= 0) {
    require(modelsPath + '/' + file);
  }
});

var app = express();

require('./config/middleware')(app, config);
require('./config/routes')(app);

var refresh = require('./app/indexing/main');

refresh.TIMEOUT = setTimeout(refresh.refresh, refresh.POLL_INTERVAL);

app.listen(config.port);
console.log('Listening on port: ' + config.port);
