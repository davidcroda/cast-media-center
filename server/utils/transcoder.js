var fs = require('fs'),
  Transcoder = require('./base_transcoder.js'),
  path = require('path'),
  config = require('../config/config')

  ;

exports.transcoding = {};
exports.isTranscoding = function (file) {
  if (file.match(/\.CONV.mp4$/)) {
    for (var t in exports.transcoding) {
      console.log("Testing ", file);
      if (file == transformPath(t)) {
        console.log("isTranscoding: true", file);
        return true;
      }
    }
    console.log("isTranscoding: false", file);
    return false;
  } else {
    console.log("isTranscoding: " + (exports.transcoding.hasOwnProperty(file)), file);
    return exports.transcoding.hasOwnProperty(file);
  }
};

function transformPath(file) {
  return file + '.transcoded.mp4';
}

exports.transcode = function (res, video) {

  if (!exports.isTranscoding(video.path)) {
    exports.transcoding[video.path] = true;

    video.transcoding = true;
    video.save();

    var vcodec = "libx264",
      acodec = "libfdk_aac";

    if (video.vcodec == "h264") vcodec = "copy";
    if (video.acodec == "aac") acodec = "copy";

    if (acodec == "copy" && vcodec == "copy") {
      video.transcoding = false;
      video.save();
      return;
    }

    var newPath = transformPath(video.path);

    var stream = fs.createReadStream(video.path);
    var transcoder = new Transcoder(stream);
    transcoder
      .videoCodec(vcodec)
      .audioCodec(acodec)
      .channels(2)
      .format('mp4')
      .on('progress', function (progress) {
        exports.transcoding[video.path] = progress;
      })
      .on('error', function (ev, ev1, ev2) {
        console.log("ERROR");
        console.log(ev, ev1, ev2);
      })
      .on('finish', function (ev) {
        console.log(ev);
        console.log("transcode finished");
        var oldPath = video.path;
        video.acodec = "aac";
        video.vcodec = "h264";
        video.transcoding = false;
        video.save(function (err) {
          if (err) throw err;
          if (oldPath != newPath) {
            fs.unlink(oldPath);
            fs.rename(newPath, oldPath);
          }
          delete exports.transcoding[video.path];
        });
        res.end();
      })
      .writeToFile(newPath);
  } else {
    res.json(exports.transcoding[video.path]);
  }
};