var site = require('../app/controllers/site'),
  api = require('../app/controllers/api'),
//twitch = require('../app/controllers/twitch'),
  refresh = require('../app/indexing/main'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  passport = require('passport');

module.exports = function (app) {
  app.get('/api/:model', passport.authenticate('local'), api.index);
  app.post('/api/:model/:id', passport.authenticate('local'), api.get);
  app.delete('/api/:model/:id', passport.authenticate('local'), api.delete);
  app.put('/api/:model/:id', passport.authenticate('local'), api.update);
  app.put('/api/:model', passport.authenticate('local'), api.create);

  app.get('/refresh', passport.authenticate('local'), refresh.index);
//app.get('/twitch/:channel', twitch.view);

  app.post('/login', passport.authenticate('local'), site.postLogin, function (req, res) {
    res.redirect('/');
  });
}