var mongoose = require('mongoose'),
  Video = mongoose.model('Video'),
  path = require('path'),
  config = require('../config/config'),
  transcoder = require('../utils/transcoder'),
  videoRegex = /(mp4|mkv|xvid|divx|mpeg|mpg|avi)/i,
  readdir = require('recursive-readdir'),
  videoHandler = require('./handlers/video')

;

exports.POLL_INTERVAL = 1000 * 60 * 5;
exports.TIMEOUT = null;

var filters = [],
  handlers = [];

var ignoreSampleFiles = function(files) {
  files.forEach(function (file, i) {
    if (file.match(/sample/)) {
      delete files[i]
    }
  });
  return files;
};

//"rar|001|zip": extractVideo,
//"mp4|mkv": processVideo


exports.registerFilter = function (filter) {
  filters.push(filter);
};
exports.registerHandler = function (handler) {
  handlers.push(handler);
};

exports.registerFilter(ignoreSampleFiles);
exports.registerHandler(videoHandler);

var lastUpdate = 0;

var FILES = [];

exports.index = function (req, res) {
  if (typeof req.query.debug != "undefined") {
    Video.collection.drop();
  }
  exports.refresh();
  res.send(200);
};

exports.refresh = function () {
  clearTimeout(exports.TIMEOUT);

  console.log("Indexing: ", config.torrentPath);

  readdir(config.downloadDir, function (err, files) {
    if (err) console.log("Error: ", err);

    if (files.length > 0) {

      filters.forEach(function (filter) {
        files = filter(files);
      });

      FILES = files;
      processFiles();
    }
  });
};

function calculateTimeout(interval) {
  var diff = Date.now() - lastUpdate;
  if (diff > (60 * 30)) {
    return interval * 72; //6 hours
  }
  return interval;
}

function processFiles(cb) {
  handlers.forEach(function (handler) {
    FILES.forEach(function (file, index) {
      console.log("Processing File: ", file);
      if (file.match(videoRegex) && !transcoder.isTranscoding(file)) {
        if (path.extname(file).match(handler.pattern)) {
          handler.callback(file, index);
        }
      }
    });
  });
  if (typeof cb == "function") {
    cb()
  } else {
    exports.TIMEOUT = setTimeout(exports.refresh, calculateTimeout(exports.POLL_INTERVAL));
  }
}