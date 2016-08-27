var mongoose = require('mongoose'),
  url = require('url'),
  fs = require('fs'),
  config = require('../config/config'),
  path = require('path'),
  tokenUtils = require('../utils/token'),
  formidable = require('formidable'),
  indexer = require('../indexing/indexer'),
  Transmission = require('../utils/transmission'),
  moment = require('moment'),
  models = {
    video: mongoose.model('Video'),
    user: mongoose.model('User')
  };

exports.index = function (req, res) {
  var sort = req.params.sort || 'title';
  console.log(sort);
  models[req.params.model].find().sort(sort).exec(function (err, results) {
    if (err) { throw new Error(err); }
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
      if (err) { throw err; }
      var localUrl = url.parse(result.source);
      res.setHeader("X-Accel-Redirect", unescape(localUrl.pathname));
      res.end();
    });
  } else {
    res.sendStatus(404);
  }
};

exports.getUser = function(req, res) {
  if(req.params.id) {



  }
};

exports.runIndexer = function (req, res) {

  if (typeof req.query.debug != "undefined") {
    models.video.collection.drop();
  }

  indexer.refresh(function() {
    res.sendStatus(200);
  });
};

exports.getToken = function(req, res) {
  tokenUtils.generateToken(req.user, function(err, token) {
    res.json({token: token});
  }, moment().add(6,'hours').toDate());
};

exports.getTorrents = function(req, res) {

  Transmission.getTorrents(function(err, torrents) {
    if (err) { throw err; }
    return res.status(200).json(torrents);
  });
};

exports.deleteTorrent = function(req, res) {

  var deleteLocal = req.params.deleteLocal || false;

  if(req.params.id) {
    Transmission.deleteTorrent(req.params.id, deleteLocal, function(err, data) {
      if (err) { throw err; }
      res.status(200).send(data);
    });
  } else {
    res.sendStatus(404);
  }
};

exports.addTorrent = function (req, res) {

  var form = new formidable.IncomingForm();

  form.parse(req, function(err, fields, files) {

    if (files.torrent) {

      Transmission.addTorrent(files.torrent.path, function() {
        res.redirect("/#/torrents");
      });

    }

  });
};

exports.del = function (req, res) {
  if (req.params.id) {

    models[req.params.model].find({
      _id: req.params.id
    }, function (err, results) {

      if (err) { throw err; }

      results.forEach(function(result) {

        if (req.params.model == 'video') {

          fs.unlink(result.path, function (err) {
            if (err) { console.log(err); }
            result.remove();
          });

        } else {
          result.remove();
        }
      });

      res.json(results);
    });
  }
};

exports.create = function (req, res) {

  var model = new models[req.params.model](req.body);
  model.save(function (err) {
    if (err) { return res.send(500); }
    return res.json(model);
  });
};

exports.update = function (req, res) {
  var _id = req.body._id;
  delete req.body._id;
  models[req.params.model].update({
    _id: _id
  }, req.body, function (err, affectedRows) {
    if (err) { res.send(500, err); }
    res.send(200, affectedRows);
  });
};

exports.updatePassword = function (req, res) {
  var _id = req.body._id;

  models.user.findOne({
      _id: _id
    }, function (err, result) {
      result.setPassword(req.body.password, function(err) {
        if(!err) {
          result.save(function(err) {
            if(!err) {
              res.send(200, result);
            } else {
              res.send(500, err);
            }
          });
        } else {
          res.send(500, err);
        }
      });
    });
};
