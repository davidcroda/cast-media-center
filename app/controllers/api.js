var mongoose = require('mongoose'),
  fs = require('fs'),
  Transcoder = require('../../lib/transcoder'),
  models = {
    video: mongoose.model('Video'),
    source: mongoose.model('Source')
  };

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
        streamVideo(res, video);
      } else {
        res.json(video);
      }
    });
  } else {
    res.send(404);
  }
};

function streamVideo(res, video) {
  res.writeHead(200, {
    'Content-Type': 'video/mp4'
  });

  var buffer = new require('stream').Duplex();
  buffer.data = "";
  buffer.size = 0;
  buffer.minSize = 100000;
  buffer._write = function(chunk, enc, next) {
    console.log("Received Chunk: Enc: " + enc + ", Length: " + chunk.length);
    buffer.data +=chunk;
    buffer.size += chunk.length;
    if(buffer.size > buffer.minSize) {
      console.log("Buffer reached minSize. Sending...");
      buffer.pipe(res);
      buffer.data = "";
      buffer.size = 0;
      //res.end();
    }
    next();
  };
  buffer._read = function(len) {
    return buffer.data;
  };
  var stream = fs.createReadStream(video.get('path'));
  var transcoder = new Transcoder(stream);
  transcoder
    .videoCodec('libx264')
    .audioCodec('libfdk_aac')
    .channels(2)
    .format('mp4')
    .on('finish', function() {
      console.log("ffmpeg process finished");
    })
    .stream()
    .pipe(res).on('close',function() {
      transcoder.kill("SIGKILL");
    });

  buffer.on('data', function(chunk) {
    console.log("onData: Received Chunk Length: " + chunk.length);
  }).on('error', function(err) {
    console.log(err);
  });
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