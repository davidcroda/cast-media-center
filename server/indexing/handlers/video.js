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

    generateThumbnail(fileRecord, 'Small', '480x270');
    generateThumbnail(fileRecord, 'Large', '1280x720');
  });
};


var generateThumbnail = function (file, sizeName, size) {
  new ffmpeg({
    source: file.path
  })
    .on('error', function (err) {
      console.log(sizeName, err);
      file['thumbnail' + sizeName] = '/img/no-thumbnail.png';
      file.save(function (err) {
        if(err != null) {
          console.log("Error saving thumbnail record", err);
        }
      });
    })
    .on('filenames', function (filenames) {
      file['thumbnail' + sizeName] = '/thumbnails/' + filenames[0];
      file.save(function (err) {
        if(err) {
          console.log("Error saving thumbnail record", err);
        }
      });
    })
    .takeScreenshots({count: 1, size: size, filename: "%f-%r"}, config.root + '/client/thumbnails/');
};

//"rar|001|zip": extractVideo,
//"mp4|mkv": processVideo
module.exports = {
  pattern: /\.(mp4|mkv|avi)/,
  callback: processVideo
};