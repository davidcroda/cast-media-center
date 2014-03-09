var mongoose = require('mongoose'),
  fs = require('fs'),
  config = require('../../config/config'),
  path = require('path'),
  Transcoder = require('../../lib/transcoder'),
  models = {
    video: mongoose.model('Video'),
    source: mongoose.model('Source')
  },
  transcoding = {};

exports.index = function (req, res) {
  if(!req.query.sort) {
    req.query.sort = '+title';
  }
  models[req.params.model].find().sort(req.query.sort).exec(function (err, videos) {
    if (err) throw new Error(err);
    videos.forEach(function(video) {
    });
    res.json(videos);
  });
};

exports.get = function (req, res) {
  if(req.params.id) {
    models[req.params.model].findOne({
      _id: req.params.id
    }, function (err, video) {
      if (err) throw err;
      if(req.params.model == 'video') {
        transcodeVideo(res, video);
      } else {
        res.json(video);
      }
    });
  } else {
    res.send(404);
  }
};

function transcodeVideo(res, video) {

  if(!transcoding.hasOwnProperty(video.path)) {
    transcoding[video.path] = true;

    var vcodec = "libx264",
        acodec = "libfdk_aac";

    if(video.vcodec == "h264") vcodec = "copy";
    if(video.acodec == "aac") acodec = "copy";

    if(acodec == "copy" && vcodec == "copy")
      return;

    var newPath = video.get('path') + '.conv.mp4';

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

        console.log(progress);
        transcoding[video.path] = progress;
        res.json(progress);
      })
      .on('finish', function() {
        console.log("ffmpeg process finished");
        fs.unlink(video.path);
        delete transcoding[video.path];
        video.path = newPath;
        video.acodec = "aac";
        video.vcodec = "h264";
        video.title = path.basename(video.path);
        video.sources = [path.join(config.urlBase), path.relative(config.indexPath, video.path)];
        video.save();
        res.end();
      })
      .writeToFile(newPath);
  } else {
    console.log("Transcode already in progress for: " + video.path);
    res.json(transcoding[video.path]);
  }
}

exports.delete = function (req, res) {
  if (req.params.id) {
    console.log('delete ' + req.params.id);
    models[req.params.model].find({
      _id: req.params.id
    }, function (err, videos) {
      if (err) throw err;
      for (var i in videos) {
        if(req.params.model == 'video') {
          fs.unlink(videos[i].path, function (err) {
            if (err) console.log(err);
            videos[i].remove();
          });
        } else {
          videos[i].remove();
        }
      }
      res.json(videos);
    });
  }
};

exports.create = function(req, res) {
  console.log(req.body);
  var model = new models[req.params.model](req.body);
  model.save(function(err) {
    if (err) return res.send(500);
    return res.json(model);
  })
};

exports.update = function(req, res) {
  var _id = req.body._id;
  delete req.body._id;
  models[req.params.model].update({
    _id: _id
  },req.body, function(err, affectedRows) {
    if(err) res.send(500, err);
    res.send(200, affectedRows);
  });
};