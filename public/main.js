// Filename: main.js

require.config({
  paths: {
    jquery: '//ajax.googleapis.com/ajax/libs/jquery/1.11.0/jquery.min',
    underscore: 'components/underscore/underscore',
    backbone: 'components/backbone/backbone',
    bootstrap: 'components/bootstrap/dist/js/bootstrap',
    excast: 'js/excast',
    chrome: 'https://www.gstatic.com/cv/js/sender/v1/cast_sender',
    isotope: 'components/isotope/jquery.isotope',
    views: 'js/views',
    models: 'js/models',
    collections: 'js/collections'
  },
  shim: {
    'backbone': {
      //These script dependencies should be loaded before loading
      //backbone.js
      deps: ['underscore', 'jquery'],
      //Once loaded, use the global 'Backbone' as the
      //module value.
      exports: 'Backbone'
    },
    'bootstrap': {
      deps: ['jquery']
    },
    'jquery': {
      exports: '$'
    },
    'underscore': {
      exports: '_'
    },
    'views': ['backbone'],
    'models': ['backbone'],
    'collections': ['backbone']
  }
});

require([
  'jquery',
  'underscore',
  'backbone',
  'views',
  'models',
  'collections',
  'excast',
  'chrome',
  'bootstrap'
], function ($, _, Backbone, views, models, collections, excast) {

  var App = {};

  $("#wrapper").html(_.template($("#layout").html()));

  var Router = Backbone.Router.extend({
    routes: {
      "": "index",
      "sources": 'sources',
      'login': 'login'
    }
  });

  App.videos = new collections.Videos(models.Video);
  App.sources = new collections.Sources(models.Source);
  App.videoView = null;
  App.sourceView = null;
  App.loginView = null;

  App.router = new Router();

  App.router.on('route:index', function () {
    App.videoView = new views.VideoView({
      excast: excast,
      el: $("#content"),
      collection: App.videos
    }).on('sort', function (sort) {
        this.collection.sort = sort;
        this.collection.url = App.videos.urlBase + App.videos.sort;
        this.collection.fetch();
      });
    var fetchOptions = {
      error: function(collection, response, options) {
        if(response.status == 401) {
          App.router.navigate('login', {trigger: true, replace: true});
        }
      }
    };
    App.videos.fetch(fetchOptions);
  });

  App.router.on('route:sources', function () {
    App.sources.fetch({
      success: function (collection, response, options) {
        App.sourceView = new views.SourceView({
          el: $("#content"),
          collection: collection,
          model: models.Source
        });
      }
    });
  });

  App.router.on('route:login', function() {
    App.loginView = new views.LoginView({
      el: $("#content")
    });
  });

  Backbone.history.start();

  return {};
});