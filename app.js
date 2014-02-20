var express = require('express'),
  mongoose = require('mongoose'),
  fs = require('fs'),
  passport = require('passport'),
  LocalStrategy = require('passport-local').Strategy,
  User = require('./app/models/user'),
  config = require('./config/config'),
  token = require(config.root + '/app/middleware/token');

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

  app.use(token.authorize);

  app.use(app.router);
  app.use(function(req, res) {
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

app.post('/login', passport.authenticate('local'), function (req, res) {
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

app.listen(config.port);
console.log('Listening on port: ' + config.port);
