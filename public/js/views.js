var views = {
  VideoView: Backbone.View.extend({
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
  }),
  SourceView: Backbone.View.extend({
    initialize: function() {
      this.render();
    },
    events: {
      'submit form': 'addSource'
    },
    addSource: function(ev) {
      var form = $(ev.currentTarget),
          data = form.serialize(),
          url = '/api/video';
      console.log(url);
      $.ajax(url, {
        method: 'PUT',
        data: data
      });
      return false;
    },
    render: function() {
      var template = _.template($("#source_template").html());
      this.$el.html(template);
    }
  })
};
define(views);