var fs = require('fs'),
  Transcoder = require('../../lib/transcoder'),
  path = require('path'),
  config = require('../../config/config')

;

exports.transcoding = {};
exports.isTranscoding = function(file) {
  if(file.match(/\.CONV.mp4$/)) {
    for (var t in exports.transcoding) {
      console.log("Testing ", file);
      if(file == transformPath(t)) {
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
  return file + '.CONV.mp4';
}

exports.transcode = function (res, video) {

  if(!exports.isTranscoding(video.path)) {
    exports.transcoding[video.path] = true;

    video.transcoding = true;
    video.save();

    var vcodec = "libx264",
      acodec = "libfdk_aac";

    if(video.vcodec == "h264") vcodec = "copy";
    if(video.acodec == "aac") acodec = "copy";

    if(acodec == "copy" && vcodec == "copy") {
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
      .on('progress', function(progress) {
        // The 'progress' event is emitted every time FFmpeg
        // reports progress information. 'progress' contains
        // the following information:
        // - 'frames': the total processed frame count
        // - 'currentFps': the framerate at which FFmpeg is
        //   currently processing
        // - 'currentKbps': the throughput at which FFmpeg is
        //   currently processing
        // - 'targetSize': the current size of the target file
        //   in kilobytes
        // - 'timemark': the timestamp of the current frame
        //   in seconds
        // - 'percent': an estimation of the progress

        exports.transcoding[video.path] = progress;
        res.json(progress);
      })
      .on('finish', function() {
        console.log("transcode finished");
        delete exports.transcoding[video.path];
        video.path = newPath;
        video.acodec = "aac";
        video.vcodec = "h264";
        video.transcoding = false;
        video.title = path.basename(video.path);
        video.sources = [path.join(config.urlBase), path.relative(config.indexPath, video.path)];
        video.save(function(err) {
          if(err) throw err;
          fs.unlink(video.path);
        });
        res.end();
      })
      .writeToFile(newPath);
  } else {
    res.json(exports.transcoding[video.path]);
  }
}