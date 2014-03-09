var views = {
  VideoView: Backbone.View.extend({
    initialize: function(options) {
      this.excast = options.excast;
      this.sort = "-date";
      this.listenTo(this.collection, 'sync', function() {
        this.render();
      });
      this.render();
      $('#video-container').isotope({
        filter: '.video',
        layout: 'fitRows'
      });
    },
    render: function() {
      var navTemplate = _.template($("#video_nav").html(), {
        current: this.sort,
        sorts: [
          {
            title: "Date",
            value: "-date"
          },
          {
            title: "Title",
            value: "+title"
          }
        ]
      });
      var videoTemplate = _.template($("#video_template").html(), {videos: this.collection});
      this.$el.html(navTemplate + videoTemplate);
    },
    events: {
      'change .video-nav select':'sortVideo',
      'click .video': 'selectVideo',
      'dblclick .video': 'playVideo',
      'click .delete-icon': 'deleteVideo'
    },
    sortVideo: function(ev) {
      var $el = $(ev.currentTarget);
      this.sort = $el.val();
      this.trigger('sort',this.sort);
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
      $('.video').removeClass('highlight').removeClass('active');
      $(ev.currentTarget).addClass('highlight');
    },
    playVideo: function(ev) {
      $('.video').removeClass('highlight').removeClass('active');
      var id = $(ev.currentTarget).attr('data-id');
      this.collection.forEach(function(video, i) {
        if(video.id != id)
          video.set('selected', false);
      });
      var video = this.collection.get(id);
      $(ev.currentTarget).addClass('active');

      this.excast.loadMedia(video);
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