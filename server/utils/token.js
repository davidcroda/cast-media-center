var mongoose = require('mongoose'),
  Token = mongoose.model('Token'),
  User = mongoose.model('User'),
  TOKEN_LENGTH = 64;

exports.generateToken = function (user, next) {
  var token = require('crypto').randomBytes(TOKEN_LENGTH, function (ex, buff) {
    token = buff.toString('hex');
    console.log("Generated Token: " + token);
    var tokenRecord = new Token({
      userId: user.id,
      token: token
    });
    tokenRecord.save(function (err) {
      if (err) return next(err);
      return next(null, token);
    });
  });
};

exports.findToken = function(token, done) {
  Token.findOne({
    token: token
  }, function (err, res) {
    if (err) return done(err);
    console.log(res);
    if (!res) {
      return done(null, false);
    }
    User.findOne({
      _id: res.userId
    }, function (err, res) {
      if (err) return done(err);
      //console.log('removing token');
      Token.remove(function() {
        return done(null, res);
      });
    });
  });
};

exports.queryToken = function(token, done) {
  Token.findOne({
    token: token
  }, function (err, res) {
    if (err) return done(err);
    console.log(res);
    if (!res) {
      return done(null, false);
    }
    User.findOne({
      _id: res.userId
    }, function (err, res) {
      if (err) return done(err);
      return done(null, res);
    });
  });
};