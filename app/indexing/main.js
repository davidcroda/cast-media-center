var mongoose = require('mongoose'),
  Video = mongoose.model('Video'),
  Source = mongoose.model('Source'),
  path = require('path'),
  config = require('../../config/config'),
  transcoder = require('../utils/transcoder'),
  videoRegex = /(mp4|mkv|xvid|divx|mpeg|mpg|avi)/i,
  types = require('./types')

exports.POLL_INTERVAL = 1000 * 60 * 5;
exports.TIMEOUT = null;

var filters = [],
    handlers = [];

//"rar|001|zip": extractVideo,
//"mp4|mkv": processVideo


exports.registerFilter = function (filter) {
  filters.push(filter);
};
exports.registerHandler = function(handler) {
  handlers.push(handler);
};

var lastUpdate = 0;

var FILES = [];

exports.index = function (req, res) {

  if (typeof req.query.debug != "undefined") {
    Video.collection.drop();
  }

  exports.refresh();
  res.redirect(302, '/');
};

exports.refresh = function () {
  clearTimeout(exports.TIMEOUT);

  Source.find().exec(function (err, results) {
    if (err) throw err;

    results.forEach(function (source) {
      types[source.type](source.path, function (err, files) {
        if (err) console.log("Error: ", err);

        filters.forEach(function (filter) {
          files = filter(files);
        });

        FILES = files;

        processFiles(source, function () {
          exports.TIMEOUT = setTimeout(exports.refresh, calculateTimeout(exports.POLL_INTERVAL));
        });
      });
    });
  })
};

function calculateTimeout(interval) {
  var diff = Date.now() - lastUpdate;
  if (diff > (60 * 30)) {
    return interval * 72; //6 hours
  }
  return interval;
}

function processFiles(source, cb) {
  handlers.forEach(function(handler) {
    FILES.forEach(function (file, index) {
      console.log("Processing File: ", file);
      if (file.match(videoRegex) && !transcoder.isTranscoding(file)) {
        if (path.extname(file).match(handler.pattern)) {
          handler.callback(source, file, index);
        }
      }
    });
  });
  if (typeof cb == "function") {
    cb()
  }
}