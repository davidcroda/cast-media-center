var views = {
  VideoView: Backbone.View.extend({
    initialize: function (options) {
      this.excast = options.excast;
      this.sort = "-date";
      this.filter = {};
      this.listenTo(this.collection, 'sync', function () {
        this.render();
      });
    },
    render: function () {
      var navTemplate = _.template($("#video_nav").html(), {
        current: this.sort,
        filter: this.filter,
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
      var _this = this;
      this.$el.html(navTemplate + videoTemplate);
      $('.transcoding').each(function (index, el) {
        console.log('checking transcode progress');
        var id = $(el).data('id');
        var video = _this.collection.get(id);
        _this.excast.transcodeVideo(video, el);
      });
      $(window).load(function () {
        _this.isotope.isotope({
          filter: '.video',
          layout: 'fitRows'
        });
      });
    },
    events: {
      'change .video-nav select': 'sortVideos',
      'change .video-nav input': 'filterVideos',
      'click .video': 'selectVideo',
      'dblclick .video': 'playVideo',
      'click .delete-icon': 'deleteVideo'
    },
    filterVideos: function (ev) {
      var $el = $(ev.currentTarget),
        field = $el.attr('name'),
        value = $el.val(),
        checked = $el.prop('checked')
      if (checked) {
        this.filter[field] = value;
      } else {
        delete this.filter[field];
      }
      console.log(this.filter);
      this.collection.forEach(function (video) {
        if (checked && video.attributes.hasOwnProperty(field) && video.get(field) != value) {
          video.set('show', false);
        } else {
          video.set('show', true);
        }
      });
      this.render();
    },
    sortVideos: function (ev) {
      var $el = $(ev.currentTarget);
      this.sort = $el.val();
      this.trigger('sort', this.sort);
    },
    deleteVideo: function (ev) {
      var video = $(ev.currentTarget).parent('.video'),
        id = video.attr('data-id');
      if (confirm("Are you sure you want to delete this video?")) {
        this.collection.get(id).destroy({
          success: function (model, response) {
            console.log(model, response);
            $('#video-container').isotope('remove', video);
          }
        });
      }
    },
    selectVideo: function (ev) {
      $('.video').removeClass('highlight').removeClass('active');
      $(ev.currentTarget).addClass('highlight');
    },
    playVideo: function (ev) {
      $('.video').removeClass('highlight').removeClass('active');
      var id = $(ev.currentTarget).attr('data-id');
      var video = this.collection.get(id);
      this.excast.loadMedia(video, ev.currentTarget);
    }
  }),
  SourceView: Backbone.View.extend({
    initialize: function () {
      this.listenTo(this.collection, 'sync', function () {
        this.render();
      });
    },
    events: {
      'submit form': 'addSource'
    },
    addSource: function (ev) {
      var form = $(ev.currentTarget),
        data = form.serialize(),
        url = '/api/source';
      console.log(url);
      $.ajax(url, {
        method: 'PUT',
        data: data
      });
      return false;
    },
    render: function () {
      var template = _.template($("#source_template").html(), {sources: this.collection});
      this.$el.html(template);
    }
  })
};

define(views);