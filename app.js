var express = require('express'),
  mongoose = require('mongoose'),
  fs = require('fs'),
  passport = require('passport'),
  LocalStrategy = require('passport-local').Strategy,
  RememberMeStrategy = require('passport-remember-me').Strategy,
  User = require('./app/models/user'),
  Token = require('./app/models/token'),
  config = require('./config/config'),
  token = require(config.root + '/app/middleware/token'),
  watch = require('node-watch');

mongoose.connect(config.db);
var db = mongoose.connection;
db.on('error', function () {
  throw new Error('unable to connect to database at ' + config.db);
});

var modelsPath = __dirname + '/app/models';
fs.readdirSync(modelsPath).forEach(function (file) {
  if (file.indexOf('.js') >= 0) {
    require(modelsPath + '/' + file);
  }
});

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
    generateToken(64, user.id, done);
  }
));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

var app = express();

app.configure(function () {
  app.use(express.compress());
  app.use(express.static(config.root + '/public'));
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

var site = require('./app/controllers/site'),
//twitch = require('../app/controllers/twitch'),
  refresh = require('./app/controllers/refresh');
app.get('/', site.index);
app.get('/api', site.api);
app.delete('/delete/:id', site.delete);
app.get('/refresh', refresh.index);
//app.get('/twitch/:channel', twitch.view);

app.get('/login', function (req, res) {
  res.render('login', { user: req.user });
});

app.post('/login', passport.authenticate('local'), function (req, res, next) {
    // issue a remember me cookie if the option was checked
    if (!req.body.remember_me) {
      console.log("NO REMEMBER ME");
      return next();
    }

    generateToken(64, req.user.id, function(err, token) {
      if(err) return next(err);
      res.cookie('remember_me', token, { path: '/', httpOnly: true, maxAge: 604800000 }); // 7 days
      return next();
    });
  },
  function (req, res) {
    res.redirect('/');
  });

var generateToken = function(len, userId, next) {
  var token = require('crypto').randomBytes(len, function (ex, buff) {
    token = buff.toString('hex');
    console.log("Generated Token: " + token);
    tokenRecord = new Token({
      userId: userId,
      token: token
    });
    tokenRecord.save(function(err) {
      if (err) return next(err);
      return next(null, token);
    });
  });
}

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

exports.init = function () {
  watch(config.indexDir, function (filename) {
    console.log(filename, ' changed.');
  });
};

app.listen(config.port);
console.log('Listening on port: ' + config.port);
