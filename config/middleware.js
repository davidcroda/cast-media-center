var express = require('express'),
    passport = require('passport'),
    utils = require('../app/controllers/utils'),
    LocalStrategy = require('passport-local').Strategy,
    RememberMeStrategy = require('passport-remember-me').Strategy,
    User = require('../app/models/user'),
    Token = require('../app/models/token')
;

module.exports = function(app, config) {

// Configure passport
  passport.use(new LocalStrategy(User.authenticate()));
  passport.use(new RememberMeStrategy(
    function (token, done) {
      Token.findOne({
        token: token
      }, function(err, res) {
        if(err) return done(err);
        console.log(res);
        if(!res) {
          return done(null, false);
        }
        user = User.findOne({
          _id: res.userId
        }, function(err, res) {
          if(err) return done(err);
          Token.remove();
          return done(null, res);
        });
      });
    },
    function (user, done) {
      utils.generateToken(64, user.id, done);
    }
  ));
  passport.serializeUser(User.serializeUser());
  passport.deserializeUser(User.deserializeUser());

  var token = require(config.root + '/app/middleware/token');
  app.configure(function () {
    app.use(express.compress());
    app.use(express.static(config.root + '/site/public'));
    app.set('port', config.port);
    app.set('views', config.root + '/app/views');
    app.set('view engine', 'jade');
    //app.use(express.favicon(config.root + '/public/img/favicon.ico'));

    app.use(express.logger('dev'));

    app.use(express.bodyParser());
    app.use(express.methodOverride());

    app.use(express.cookieParser('your secret here'));
    app.use(express.session());

    app.use(passport.initialize());
    app.use(passport.session());
    app.use(passport.authenticate('remember-me'));

    app.use(token.authorize);

    app.use(app.router);
    app.use(function (req, res) {
      res.status(404).render('404', { title: '404' });
    });
  });
}