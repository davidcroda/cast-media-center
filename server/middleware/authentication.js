var tokenUtils = require('../utils/token'),
  mongoose = require('mongoose'),
  User = mongoose.model('User');

module.exports = function (req, res, next) {

  //res.setHeader('Access-Control-Allow-Origin', '*');
  //res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');

  var token;

  if (req.path == '/login' ||
    req.path == '/register' ||
    req.isAuthenticated() ) {
    next();
  } else if((token = req.query['token'] || req.headers['x-token']) != undefined) {

    tokenUtils.queryToken(token, function(err, user) {
      //console.log(err, user);
      if(err) throw err;
      if(user) {
        req.login(user, function(err) {
          if(err) throw err;
          //console.log('SUCCESS');
          next();
        });
      } else {
        res.sendStatus(401);
      }
    });

  } else {
    res.sendStatus(401);
  }
};