var mongoose = require('mongoose'),
  Video = mongoose.model('Video'),
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