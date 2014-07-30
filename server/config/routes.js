var site = require('../app/controllers/site'),
  api = require('../app/controllers/api'),
//twitch = require('../app/controllers/twitch'),
  refresh = require('../app/indexing/main'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  passport = require('passport');

module.exports = function (app) {
  app.get('/api/:model', api.index);
  app.post('/api/:model/:id', api.get);
  app.delete('/api/:model/:id', api.delete);
  app.post('/api/torrent', api.addTorrent);
  app.put('/api/:model/:id', api.update);
  app.put('/api/:model', api.create);

  app.get('/refresh', refresh.index);
//app.get('/twitch/:channel', twitch.view);

  app.get('/logout', function(req, res) {
    res.clearCookie('remember_me');
    req.logout();
    res.redirect('/');
  });
  app.get('/register', site.register);
  app.post('/login', passport.authenticate('local'), site.postLogin, function (req, res) {
    res.json(req.user);
  });
};