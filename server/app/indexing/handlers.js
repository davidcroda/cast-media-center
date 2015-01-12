var mongoose = require('mongoose'),
  Video = mongoose.model('Video'),
  Track = mongoose.model('Track'),
  ffmpeg = require('fluent-ffmpeg'),
  rarfile = require('rarfile').RarFile,
  config = require('../../config/config'),
  path = require('path'),
  sizes = {
    Small: '480x270',
    Large: '1280x720'
  },
  url = require('url'),
  fs = require('fs')

var processVideo = function (source, video) {
  Video.find({
    path: video
  }, function (err, results) {
    if (err) {
      console.log("Error: ", err);
    } else {
      if (results.length == 0) {
        lastUpdate = Date.now();
        createVideoRecord(source, video);
      } else {
        console.log("Found existing video for path: ", video);
      }
    }
  });
};


var createVideoRecord = function (source, file) {
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
      sources: [url.resolve(source.baseUrl, path.relative(source.path, file))],
      watched: false,
      vcodec: vcodec,
      acodec: acodec,
      tracks: []
    });

    console.log(srt);

    if (fs.existsSync(srt)) {
      var trackRecord = new Track({
        id: 1,
        type: "text",
        subtype: "captions",
        contentId: url.resolve(source.baseUrl, path.relative(source.path.replace(/\..*$/, ".srt"), srt)),
        name: "English Subtitle",
        language: "en-US"
      });
      fileRecord.tracks.push(trackRecord);
    }

    fileRecord.save(function (err) {
      if (err)
        console.log("Error: " + err);
    });

    //horrible hack
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
      console.log(filenames);
      file['thumbnail' + sizeName] = config.thumbnailUrl + filenames[0];
      file.save(function (err) {
        if(err != null) {
          console.log("Error saving thumbnail record", err);
        }
      });
    })
    .takeScreenshots({count: 1, size: size, filename: "%f-%r"}, config.thumbnailPath);
};


function extractVideo(source, archive, index) {
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


//"rar|001|zip": extractVideo,
//"mp4|mkv": processVideo
exports.video = {
  pattern: /\.(mp4|mkv|avi)/,
  callback: processVideo
};