var site = require('../controllers/site'),
  api = require('../controllers/api'),
//twitch = require('../app/controllers/twitch'),
  refresh = require('../indexing/main'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  passport = require('passport');

module.exports = function (app) {
  app.get('/api/refresh', refresh.index);
  app.get('/api/:model', api.index);
  app.get('/load/:id', api.get);
  //app.post('/api/:model/:id', api.transcode);
  app.delete('/api/:model/:id', api.del);
  app.post('/api/torrent', api.addTorrent);
  app.put('/api/:model/:id', api.update);
  app.put('/api/:model', api.create);
//app.get('/twitch/:channel', twitch.view);

  app.post('/api/token', api.getToken);

  app.get('/logout', function (req, res) {
    res.clearCookie('remember_me');
    req.logout();
    res.redirect('/');
  });

  app.get('/oauth2', site.oauth2);

  app.post('/login', function(req, res, next) {
    console.log(req.body);
    next();
  },passport.authenticate('local'), site.postLogin, function (req, res) {
    console.log(req.body);
    if(req.query['redirect']) {
      res.redirect("/" + req.query['redirect']);
    }
    res.json(req.user);
  });

  app.use(function (req, res) {
    res.status(404).render('404', {title: '404'});
  });
};