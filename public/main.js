// Filename: main.js

require.config({
  paths: {
    jquery: '//ajax.googleapis.com/ajax/libs/jquery/1.11.0/jquery.min',
    underscore: 'components/underscore/underscore',
    backbone: 'components/backbone/backbone',
    bootstrap: 'components/bootstrap/dist/js/bootstrap',
    excast: 'js/excast',
    chrome: 'https://www.gstatic.com/cv/js/sender/v1/cast_sender',
    isotope: 'components/isotope/jquery.isotope'
  }
});

require([
  'jquery',
  'underscore',
  'backbone',
  'excast',
  'chrome',
  'isotope'
], function($, _, Backbone, excast) {

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
//        this.on('change:selected',function(model, value, options) {
//          console.log(model);
//          console.log(value);
//          console.log(options);
//          model.save();
//        });
    }
  });

  var VideoView = Backbone.View.extend({
    initialize: function() {
      this.render();
      $('#video-container').isotope({
        filter: '.video',
        layout: 'fitRows'
      });
    },
    render: function() {
      var template = _.template($("#video_template").html(), {videos: this.collection});
      this.$el.html(template);
    },
    events: {
      'dblclick .video': 'selectVideo',
      'click .delete-icon': 'deleteVideo'
    },
    deleteVideo: function(ev) {
      var video = $(ev.currentTarget).parent('.video'),
          id = video.attr('data-id');
      if (confirm("Are you sure you want to delete this video?")) {
        this.collection.get(id).destroy({
          success: function(model, response) {
            console.log(model, response);
            $('#video-container').isotope('remove', video);
          }
        });
      }
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
        excast.loadMedia(video.get('title'),video.get('sources')[0],video.get('thumbnailLarge'));
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
      collection.forEach(function(model) {
        model.set('id',model.get('_id'));
      });
      var video_view = new VideoView({
        el: $("#content"),
        collection: collection
      });
    }
  });

  return {};
});