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
    models: 'js/models'
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
    'models': ['backbone']
  }
});

require([
  'jquery',
  'underscore',
  'backbone',
  'views',
  'models',
  'excast',
  'chrome',
  'isotope'
], function($, _, Backbone, views, models, excast) {

  var Router = Backbone.Router.extend({
    routes: {
      "": "index",
      "sources": 'sources'
    }
  });

  var VideoList = Backbone.Collection.extend({
    model: models.Video,
    url: '/api/video'
  });
  var videos = new VideoList(),
      video_view = null;

  var appRouter = new Router();
  console.log(appRouter);
  appRouter.on('route:index', function() {
    videos.fetch({
      success: function(collection, response, options) {
        collection.forEach(function(model) {
          model.set('id',model.get('_id'));
        });
        video_view = new views.VideoView({
          el: $("#content"),
          collection: collection
        });
      }
    });
  });
  appRouter.on('route:sources', function() {
    video_view = new views.SourceView({
      el: $("#content")
    });
  });

  Backbone.history.start();

  return {};
});