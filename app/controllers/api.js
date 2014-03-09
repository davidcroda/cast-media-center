var mongoose = require('mongoose'),
  fs = require('fs'),
  config = require('../../config/config'),
  transcoder = require('./transcoder'),
  path = require('path'),
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
        transcoder.transcode(res, video);
      } else {
        res.json(video);
      }
    });
  } else {
    res.send(404);
  }
};

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