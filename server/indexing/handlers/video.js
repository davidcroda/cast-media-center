var mongoose = require('mongoose'),
  Video = mongoose.model('Video'),
  Track = mongoose.model('Track'),
  ffmpeg = require('fluent-ffmpeg'),
  config = require('../../config/config'),
  path = require('path'),
  sizes = {
    Small: '480x270',
    Large: '1280x720'
  },
  url = require('url'),
  fs = require('fs')

;

var processVideo = function (video) {
  var Indexer = require('../indexer');

  Video.find({
    path: video
  }, function (err, results) {
    if (err) {
      console.log("Error: ", err);
    } else {
      if (results.length == 0) {
        Indexer.lastUpdate = Date.now();
        createVideoRecord(video);
      } else {
        console.log("Found existing video for path: ", video);
      }
    }
  });
};


var createVideoRecord = function (file) {
  var stat = fs.statSync(file);
  var srt = file.replace(/\.[a-zA-Z0-9]*4?$/, ".srt");
  var ffmpeg = require('fluent-ffmpeg');

  ffmpeg(file).ffprobe(function (err, data) {

    var vcodec = acodec = '';

    if (err) {
      console.log("FFProbe not found, media type detection disabled.");
      //Just fudge it and hope chromecast can play it
      vcodec = "h264";
      acodec = "aac";
    } else {

      data.streams.forEach(function (stream) {
        if (stream.codec_type == 'video') {
          vcodec = stream.codec_name;
        } else if (stream.codec_type == 'audio') {
          acodec = stream.codec_name;
        }
      });
    }

    var fileRecord = new Video({
      title: path.basename(file),
      path: file,
      date: stat.mtime,
      source: "/" + path.relative(config.root, file),
      watched: false,
      vcodec: vcodec,
      acodec: acodec,
      tracks: []
    });

    if (fs.existsSync(srt)) {
      var trackRecord = new Track({
        id: 1,
        type: "text",
        subtype: "captions",
        contentId: path.relative(config.root, srt),
        name: "English Subtitle",
        language: "en-US"
      });
      fileRecord.tracks.push(trackRecord);
    }

    fileRecord.save(function (err) {
      if (err)
        console.log("Error: " + err);
    });
  });
};

//"rar|001|zip": extractVideo,
//"mp4|mkv": processVideo
module.exports = {
  pattern: /\.(mp4|mkv|avi)$/,
  process: processVideo
};
