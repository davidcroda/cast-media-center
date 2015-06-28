var path = require('path'),
  config = require('../config/config'),
  readdir = require('recursive-readdir'),
  sleep = require('sleep');

var Indexer = function(options) {

  this.options = options || {};
  this.handlers = [];
  this.filters = [];

  this.interval = 1000 * 60 * 5;
  this.timeout = null;
  this.lastUpdate = 0;

  this.files = [];
  this.running = false;

};

Indexer.prototype.registerFilter = function (filter) {
  this.filters.push(filter);
};
Indexer.prototype.registerHandler = function (handler) {
  this.handlers.push(handler);
};

Indexer.prototype.refresh = function (cb) {

  var _this = indexer;

  if(_this.running) {
    console.log("Indexer already running, returning.");
    return false;
  }

  _this.stopTimer();
  _this.running = true;

  readdir(config.downloadDir, function (err, files) {

    if (err) console.error("Error: ", err);

    indexer.files = files;

    indexer.processFiles(function() {
      _this.running = false;
      _this.startTimer();
      if (typeof cb == "function") {
        cb()
      }
    });
  });
};

Indexer.prototype.calculateTimeout = function (interval) {
  var diff = Date.now() - this.lastUpdate;
  if (this.lastUpdate > 0 && diff > (60 * 30)) {
    return interval * 72; //6 hours
  }
  return interval;
};

Indexer.prototype.pushFile = function(file) {
  this.files.push(file);
};

Indexer.prototype.processFiles = function (cb) {

  var _this = indexer;


  (function(file) {

    while((file = _this.files.pop())) {

      var processFile = _this.filters.reduce(function(carry, filter) {
        return (carry && filter(file));
      }, true);

      if(processFile) {

        _this.handlers.forEach(function (handler) {

          if (file.match(handler.pattern)) {
            console.log("Processing File: ", file);
            handler.process(file);
          }
        });

      }
    }

  })(false);

  if (typeof cb == "function") {
    cb()
  }

};

Indexer.prototype.startTimer = function() {
  var interval = indexer.calculateTimeout(indexer.interval);

  indexer.timeout = setTimeout(indexer.refresh, interval);
};

Indexer.prototype.stopTimer = function() {
  clearTimeout(this.timeout);
};

var indexer = new Indexer(),
  sampleFilter = require('./filters/skip_samples'),
  transcodingFilter = require('./filters/skip_transcoding'),
  videoFilter = require('./filters/videos'),

  videoHandler = require('./handlers/video'),
  archiveHandler = require('./handlers/archive');

indexer.registerFilter(videoFilter);
indexer.registerFilter(transcodingFilter);
indexer.registerFilter(sampleFilter);

indexer.registerHandler(videoHandler);
indexer.registerHandler(archiveHandler);

module.exports = indexer;