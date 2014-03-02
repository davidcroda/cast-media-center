var site = require('../app/controllers/site'),
  api = require('../app/controllers/api'),
//twitch = require('../app/controllers/twitch'),
  refresh = require('../app/controllers/refresh'),
  passport = require('passport');

module.exports = function(app) {
  app.get('/video', api.index);
  app.get('/video/:id', api.get);
  app.delete('/video/:id', api.delete);
  app.post('/video', api.update);

  app.get('/refresh', refresh.index);
//app.get('/twitch/:channel', twitch.view);

  app.get('/login', site.login);

  app.post('/login', passport.authenticate('local'), site.postLogin, function (req, res) {
    res.redirect('/');
  });

//app.get('/register', function(req, res) {
//    User.collection.drop();
//    User.register(new User({
//        username: 'dave'
//    }), 'ironfire', function(err, account) {
//        req.login(account, function(err) {
//            if(err) {
//                res.redirect('/login');
//            }
//        });
//        res.redirect('/');
//    });
//});
}