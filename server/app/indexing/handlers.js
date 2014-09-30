var mongoose = require('mongoose'),
  Video = mongoose.model('Video'),
  ffmpeg = require('fluent-ffmpeg'),
  metadata = require('fluent-ffmpeg').Metadata,
  rarfile = require('rarfile').RarFile,
  config = require('../../config/config'),
  path = require('path'),
  sizes = {
    Small: '480x270',
    Large: '1280x720'
  },
  url = require('url'),
  fs = require('fs')

var processVideo = function(source, video) {
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
  var ffmpeg = require('fluent-ffmpeg');
  console.log(file);
  ffmpeg(file).ffprobe(function(err, data) {

    if(err) throw err;

    var vcodec = acodec = '';

    data.streams.forEach(function(stream) {
      if(stream.codec_type == 'video') {
        vcodec = stream.codec_name;
      } else if (stream.codec_type == 'audio') {
        acodec = stream.codec_name;
      }
    });


    var fileRecord = new Video({
      title: path.basename(file),
      path: file,
      date: stat.mtime,
      sources: [url.resolve(source.baseUrl, path.relative(source.path, file))],
      watched: false,
      vcodec: vcodec,
      acodec: acodec
    });

    //horrible hack
    generateThumbnail(fileRecord, 'Small', '480x270', function (err, sizeName, url) {
      if (!err) {
        console.log('Thumbnail created ' + sizeName + ' thumbnail at ' + url);
        fileRecord['thumbnail' + sizeName] = url;
      } else {
        console.log("Error generating thumbnail", err);
        fileRecord['thumbnail' + sizeName] = '/img/no-thumbnail.png';
      }

      generateThumbnail(fileRecord, 'Large', '1280x720', function (err, sizeName, url) {
        if (!err) {
          console.log('Thumbnail created ' + sizeName + ' thumbnail at ' + url);
          fileRecord['thumbnail' + sizeName] = url;
        } else {
          console.log("Error generating thumbnail", err);
          fileRecord['thumbnail' + sizeName] = '/img/no-thumbnail.png';
        }

        fileRecord.save(function (err) {
          if (err)
            console.log("Error: " + err);
        });

      });

    });
  });
};



var generateThumbnail = function (file, sizeName, size, cb) {
  new ffmpeg({
    source: file.path
  })
  .on('error', function (err) {
    cb(err, sizeName, null);
  })
  .on('filenames', function (filenames) {
    cb(null, sizeName, config.thumbnailUrl + filenames[0]);
  })
  .takeScreenshots({count:1, size: size},config.thumbnailPath);
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