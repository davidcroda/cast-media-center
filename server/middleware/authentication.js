var tokenUtils = require('../utils/token'),
  mongoose = require('mongoose'),
  User = mongoose.model('User');

module.exports = function (req, res, next) {

  //console.log(req.headers);
  console.log("Auth: " + req.isAuthenticated());
  console.log("Path: " + req.path);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');

  if (req.path == '/login' ||
    req.path == '/register' ||
    req.isAuthenticated() ) {
    return next();
  } else if(req.query['token']) {

    var token = req.query['token'];
    tokenUtils.queryToken(token, function(err, user) {
      //console.log(err, user);
      if(err) throw err;
      if(user) {
        req.login(user, function(err) {
          if(err) throw err;
          //console.log('SUCCESS');
          return next();
        });
      } else {
        res.sendStatus(401);
      }
    });
  } else if((process.env.TOKEN && req.headers['x-token'] == process.env.TOKEN)) {
    User.findOne(function(err, user) {
      req.login(user, function (err) {
        if (err) throw err;
        return next();
      });
    });
  } else {
    res.sendStatus(401);
  }
};