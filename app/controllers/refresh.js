var mongoose = require('mongoose'),
  Video = mongoose.model('Video'),
  path = require('path'),
  fs = require('fs'),
  readdir = require('recursive-readdir'),
  config = require('../../config/config'),
  ffmpeg = require('fluent-ffmpeg'),
  rarfile = require('rarfile').RarFile,
  sizes = {
    Small: '480x270',
    Large: '1280x720'
  },
  handlers = {
    //"rar|001|zip": extractVideo,
    "mp4|mkv": processVideo
  },
  videoRegex = /(mp4|mkv|x264|xvid|divx|mpeg|mpg|avi)/i;

exports.POLL_INTERVAL = 1000 * 60 * 5;
exports.TIMEOUT = null;

var lastUpdate = 0;

var FILES = [];

exports.index = function (req, res) {
  if(req.query.debug) {
    Video.collection.drop();
  }

  exports.refresh();
  res.redirect(302, '/');
};

exports.refresh = function () {
  clearTimeout(exports.TIMEOUT);
  readdir(config.indexPath, function (err, files) {
    if (err) console.log("Error: ", err);

    FILES = files;

    processFiles(function () {
      var diff = Date.now() - lastUpdate;
      exports.TIMEOUT = setTimeout(exports.refresh, calculateTimeout(exports.POLL_INTERVAL, diff));
    });
  });
};

function calculateTimeout(interval, diff) {
  if(diff > (60 * 30)) {
    return interval * 72; //6 hours
  }
  return interval;
}

function processFiles(cb) {
  for(var ext in handlers) {
    FILES.forEach(function(file, index) {
      if(file.match(videoRegex)) {
        var re = new RegExp("\." + ext);
        if(path.extname(file).match(re)) {
          handlers[ext](file, index);
        }
      }
    });
  }
  if (typeof cb == "function") {
    cb()
  }
}

function processVideo(video) {
  Video.find({
    path: video
  }, function (err, results) {
    if (err) {
      console.log("Error: ", err);
    } else {
      if (results.length == 0) {
        lastUpdate = Date.now();
        createVideoRecord(video);
      } else {
        console.log("Found existing video for path: ", video);
      }
    }
  });
}

function extractVideo(archive, index) {
  console.log("Extract ", archive);

  var rf = new rarfile(archive, {
    debugMode: true
  });
  console.log(rf.toString());
  // { names: [ '0.jpg', '2.jpg']}

////readFile function
//  rf.readFile('0.jpg', function(err, fdata) {
//    console.log("File 0.jpg is " + fdata.length + " bytes long.");
//  });

  return archive + ".test.mp4";
}

function createVideoRecord(file) {
  var fileRecord = new Video({
    name: path.basename(file),
    path: file,
    sources: [config.urlBase + path.relative(config.indexPath, file)]
  });
  console.log("Creating Video record for ", file);
  for (var size in sizes) {
    console.log("Creating Thumbnail size: " + sizes[size]);
    generateThumbnail(fileRecord, size, sizes[size], function (err, sizeName, url) {
      if (!err) {
        console.log('Thumbnail created ' + sizeName + ' thumbnail at ' + url);
        fileRecord['thumbnail' + sizeName] = url;
        fileRecord.save(function (err) {
          if (err)
            console.log("Error: " + err);
        });
      } else {
        console.log("Error generating thumbnail", err);
      }
    });
  }
}

function generateThumbnail(file, sizeName, size, cb) {
  var proc = new ffmpeg({
    source: file.path
  })
    .withSize(size)
    .takeScreenshots({
      count: 1,
      filename: "%b-%w-%h"
    }, config.thumbnailPath, function (err, filenames) {
      if (err) {
        console.log("Error processing: " + file.path);
        console.log(err);
        cb(err, null);
      } else {
        cb(null, sizeName, config.thumbnailUrl + filenames[0]);
      }
    });
}