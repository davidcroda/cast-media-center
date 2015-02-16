var mongoose = require('mongoose'),
  url = require('url'),
  fs = require('fs'),
  config = require('../config/config'),
  path = require('path'),
  tokenUtils = require('../utils/token'),
  models = {
    video: mongoose.model('Video')
  };

exports.index = function (req, res) {
  if (!req.query.sort) {
    req.query.sort = '-date';
  }

  models[req.params.model].find().sort(req.query.sort).exec(function (err, results) {
    if (err) throw new Error(err);
    var json = {};
    json[req.params.model] = results;
    res.json(json);
  });
};

exports.get = function (req, res) {
  if (req.params.id) {
    models.video.findOne({
      _id: req.params.id
    }, function (err, result) {
      if (err) throw err;
      var localUrl = url.parse(result.source);
      res.setHeader("X-Accel-Redirect", localUrl.pathname);
      res.end();
    });
  } else {
    res.sendStatus(404);
  }
};

exports.getToken = function(req, res) {
  tokenUtils.generateToken(req.user, function(err, token) {
    res.json({token: token});
  });
};

exports.addTorrent = function (req, res) {

  if (req.files.torrent) {
    var dest = path.join(config.watchPath, req.files.torrent.name);
    fs.rename(req.files.torrent.path, dest, function (err) {
      if (err) {
        if(err.code == 'EXDEV') {
          //Cannot rename across file systems, copy instead
          var instream = fs.createReadStream(req.files.torrent.path),
            outstream = fs.createWriteStream(dest);
          instream.pipe(outstream);
          fs.unlinkSync(req.files.torrent.path);
        } else {
          res.send(500);
        }
      }

      res.redirect("/");

    });
  }
};

exports.del = function (req, res) {
  if (req.params.id) {
    console.log('delete ' + req.params.id);
    models[req.params.model].find({
      _id: req.params.id
    }, function (err, videos) {
      if (err) throw err;
      for (var i in videos) {
        if (req.params.model == 'video') {
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

exports.create = function (req, res) {
  console.log(req.body);
  var model = new models[req.params.model](req.body);
  model.save(function (err) {
    if (err) return res.send(500);
    return res.json(model);
  })
};

exports.update = function (req, res) {
  var _id = req.body._id;
  delete req.body._id;
  models[req.params.model].update({
    _id: _id
  }, req.body, function (err, affectedRows) {
    if (err) res.send(500, err);
    res.send(200, affectedRows);
  });
};