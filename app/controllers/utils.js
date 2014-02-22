var Token = require('../models/token');

exports.generateToken = function(len, userId, next) {
  var token = require('crypto').randomBytes(len, function (ex, buff) {
    token = buff.toString('hex');
    console.log("Generated Token: " + token);
    tokenRecord = new Token({
      userId: userId,
      token: token
    });
    tokenRecord.save(function(err) {
      if (err) return next(err);
      return next(null, token);
    });
  });
};