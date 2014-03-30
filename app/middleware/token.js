exports.authorize = function (req, res, next) {
  console.log("Auth: " + req.isAuthenticated());
  console.log("Path: " + req.path);
  if (req.path == '/login' ||
    req.path == '/register' ||
    req.isAuthenticated() ||
    (process.env.TOKEN && req.headers['x-token'] == process.env.TOKEN)) {
    return next();
  } else {
    return res.send(401);
  }
};