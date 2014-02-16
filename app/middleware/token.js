
exports.authorize = function(req, res, next) {
  if(req.path == '/l' || req.isAuthenticated() || req.headers['x-token'] == process.env.TOKEN) {
    return next();
  } else {
    return res.send(404);
  }
};