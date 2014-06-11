var utils = require('./utils');

exports.postLogin = function (req, res, next) {
  // issue a remember me cookie if the option was checked
  if (!req.body.remember_me) {
    return next();
  }

  console.log(req.user);

  utils.generateToken(64, req.user.id, function (err, token) {
    if (err) return next(err);
    res.cookie('remember_me', token, { path: '/', httpOnly: true, maxAge: 604800000 }); // 7 days
    return next();
  });
};