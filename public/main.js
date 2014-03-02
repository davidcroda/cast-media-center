// Filename: main.js

require.config({
  paths: {
    jquery: 'components/jquery/dist/jquery',
    underscore: 'components/underscore/underscore',
    backbone: 'components/backbone/backbone',
    bootstrap: 'components/bootstrap/dist/js/bootstrap'
  }
});

require([
  'jquery',
  'underscore',
  'backbone'
], function($, _, Backbone) {
  require(['bootstrap'], function(bootstrap) {
    var Video = Backbone.Model.extend({
      urlRoot: '/video',
      defaults: {
        title: '',
        subtitle: '',
        duration: 0,
        url: '',
        thumbnailSmall: '',
        thumbnailLarge: '',
        selected: false
      },
      initialize: function(options) {
        this.id = options._id;
        this.on('change:selected',function(model, value, options) {
          console.log(model);
          console.log(value);
          console.log(options);
          model.save();
        });
      }
    });

    var VideoView = Backbone.View.extend({
      initialize: function() {
        this.render();
      },
      render: function() {
        var template = _.template($("#video_template").html(), {videos: this.collection});
        this.$el.html(template);
      },
      events: {
        'click .video': 'selectVideo'
      },
      selectVideo: function(ev) {
        var id = $(ev.currentTarget).attr('data-id');
        $('.video').removeClass('active');
        this.collection.forEach(function(video, i) {
            if(video.id != id)
              video.set('selected', false);
        });
        var video = this.collection.get(id);
        video.set('selected',!video.get('selected'));
        if(video.get('selected')) {
          $(ev.currentTarget).addClass('active');
        }
      }
    });

    var VideoList = Backbone.Collection.extend({
      model: Video,
      url: '/video'
    });

    var videos = new VideoList();
    videos.fetch({
      success: function(collection, response, options) {
        console.log(collection);
        var video_view = new VideoView({
          el: $("#content"),
          collection: collection
        });
      }
    });

    return {};
  });
});