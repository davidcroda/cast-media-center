var mongoose = require('mongoose'),
  Video = mongoose.model('Video'),
  fs = require('fs'),
  utils = require('./utils');

exports.index = function (req, res) {
  Video.find(function (err, videos) {
    if (err) throw new Error(err);
    res.render('index', {
      title: 'Media Home',
      videos: videos
    });
  });
};

exports.api = function (req, res) {
  Video.find(function (err, videos) {
    if (err) throw new Error(err);
    res.json({
      videos: videos
    });
  });
};

exports.delete = function (req, res) {
  console.log(req.params);
  if (req.params.id) {
    console.log('delete ' + req.params.id);
    Video.find({
      _id: req.params.id
    }, function (err, videos) {
      console.log(videos);
      if (err) throw err;
      for (var i in videos) {
        fs.unlink(videos[i].path, function (err) {
          if (err) console.log(err);
          videos[i].remove();
          res.send(200);
        });
      }
    });
  }
};

exports.login = function (req, res) {
  res.render('login', { user: req.user });
};

exports.postLogin = function (req, res, next) {
  // issue a remember me cookie if the option was checked
  if (!req.body.remember_me) {
    console.log("NO REMEMBER ME");
    return next();
  }

  utils.generateToken(64, req.user.id, function (err, token) {
    if (err) return next(err);
    res.cookie('remember_me', token, { path: '/', httpOnly: true, maxAge: 604800000 }); // 7 days
    return next();
  });
};