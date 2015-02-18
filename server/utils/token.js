var mongoose = require('mongoose'),
  Token = mongoose.model('Token'),
  User = mongoose.model('User'),
  moment = require('moment'),
  TOKEN_LENGTH = 64;

exports.generateToken = function (user, next, expiration) {
  var token = require('crypto').randomBytes(TOKEN_LENGTH, function (ex, buff) {
    token = buff.toString('hex');
    console.log("Generated Token: " + token);

    var data = {
      userId: user.id,
      token: token
    };

    if(typeof expiration != "undefined") {
      data.expiresAt = moment().add(6,'hours').toDate();
    }

    var tokenRecord = new Token(data);
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