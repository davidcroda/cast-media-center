var express = require('express'),
  passport = require('passport'),
  utils = require('../utils/token'),
  mongoose = require('mongoose'),
  LocalStrategy = require('passport-local').Strategy,
  RememberMeStrategy = require('passport-remember-me').Strategy,
  authentication = require('../middleware/authentication'),
  User = mongoose.model('User'),
  bodyParser = require('body-parser'),
  cookieParser = require('cookie-parser'),
  session = require('express-session'),
  compression = require('compression'),
  morgan = require('morgan'),
  config = require('./config')

;

module.exports = function (app, config) {

// Configure passport
  passport.use(new LocalStrategy(User.authenticate()));
  passport.use(new RememberMeStrategy(utils.findToken, utils.generateToken));
  passport.serializeUser(User.serializeUser());
  passport.deserializeUser(User.deserializeUser());

  app.use(compression());
  app.use(express.static(config.root + '/client'));
  app.set('port', config.port);
  app.set('views', config.root + '/server/views');
  app.set('view engine', 'jade');
  //app.use(express.favicon(config.root + '/public/img/favicon.ico'));

  app.use(morgan('combined'));

  app.use(bodyParser.urlencoded({extended: false}));
  app.use(bodyParser.json());

  //app.use(express.methodOverride());

  app.use(cookieParser(config.secret));
  app.use(session({
    secret: config.secret,
    saveUninitialized: false,
    resave: false
  }));

  app.use(passport.initialize());
  app.use(passport.session());
  app.use(passport.authenticate('remember-me'));
  app.use(authentication);
};