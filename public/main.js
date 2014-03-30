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
  'chrome'
], function ($, _, Backbone, views, models, collections, excast) {

  $("#wrapper").html(_.template($("#layout").html()));

  var Router = Backbone.Router.extend({
    routes: {
      "": "index",
      "sources": 'sources',
      'login': 'login'
    }
  });

  var videos = new collections.Videos(models.Video),
    sources = new collections.Sources(models.Source),
    videoView = null,
    sourceView = null,
    loginView = null
    ;

  var appRouter = new Router();

  appRouter.on('route:index', function () {
    videos.fetch({
      success: function (collection, response, options) {
        collection.forEach(function (model) {
          model.set('id', model.get('_id'));
          model.set('show', true);
        });
        videoView = new views.VideoView({
          excast: excast,
          el: $("#content"),
          collection: collection
        }).on('sort', function (sort) {
            this.collection.sort = sort;
            this.collection.url = videos.urlBase + videos.sort;
            this.collection.fetch();
          });
      },
      error: function(collection, response, options) {
//        console.log("Collection:", collection);
//        console.log("Response:", response);
//        console.log("Options:", options);
        if(response.status == 401) {
          appRouter.navigate('login', {trigger: true, replace: true});
        }
      }
    });
  });

  appRouter.on('route:sources', function () {
    sources.fetch({
      success: function (collection, response, options) {
        sourceView = new views.SourceView({
          el: $("#content"),
          collection: collection,
          model: models.Source
        });
      }
    });
  });

  appRouter.on('route:login', function() {
    console.log('hello');
    loginView = new views.LoginView({
      el: $("#content")
    });
  });

  Backbone.history.start();

  return {};
});