var utils = require('../utils/token'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Token = mongoose.model('Token'),
  moment = require('moment')
;

exports.postLogin = function (req, res, next) {
  // issue a remember me cookie if the option was checked
  if (!req.body.remember_me) {

    return next();
  }

  console.log(req.user);

  utils.generateToken(req.user, function (err, token) {
    if (err) return next(err);
    res.cookie('remember_me', token, {path: '/', httpOnly: true, maxAge: 604800000}); // 7 days
    return next();
  });
};

exports.oauth2 = function(req, res, next) {
  utils.generateToken(req.user, function(err, token) {
    if (err) { throw err; }
    var url = "intent:#Intent;action=com.google.sample.cast.refplayer.api.LOGIN_HANDLER;S.token=" + token + ";end";
    console.log("Redirecting to url: ", url);
    return res.redirect(url);
  }, moment().add(30,'days').toDate());
};

exports.renderLogin = function(req, res) {
  return res.render('login.html');
};