var AppView = Backbone.View.extend({
  initialize: function(App) {
    this.App = App;
  }
});

var views = {
  VideoView: AppView.extend({
    initialize: function (options) {
      this.excast = options.excast;
      this.sort = "-date";
      this.filter = {};
      this.listenTo(this.collection, 'sync reset', function () {
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
      var videoTemplate = _.template($("#video_template").html(), {videos: this.collection.models});
      var _this = this;
      this.$el.html(navTemplate + videoTemplate);
      $('.transcoding').each(function (index, el) {
        console.log('checking transcode progress');
        var id = $(el).data('id');
        var video = _this.collection.get(id);
        _this.excast.transcodeVideo(video, el);
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
          video.set('hide', true);
        } else {
          video.set('hide', false);
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
      var videoEl = $(ev.currentTarget).parents('.video'),
        id = videoEl.data('id'),
        video = this.collection.get(id);
      if (typeof video != "undefined" && confirm("Are you sure you want to delete " + video.get('title') + "?")) {
        video.destroy({
          success: function (model, response) {
            console.log(model, response);
            videoEl.remove();
            return ev.preventDefault();
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


  SourceView: AppView.extend({
    initialize: function (options) {
      this.model = options.model;
      this.listenTo(this.collection, 'sync', function () {
        this.render();
      });
    },
    events: {
      'click .delete-link': 'deleteSource',
      'submit form': 'addSource'
    },
    deleteSource: function(ev) {
      var id = $(ev.currentTarget).attr('rel');
      var source = this.collection.get(id);
      console.log(source);
      if(confirm("Are you sure you want to delete this source?")) {
        var model = new this.model(source).destroy();
        this.collection.sync();
      }
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
  }),

  LoginView: AppView.extend({
    initialize: function() {
      console.log(this.user);
      console.log(this.App);
      $("#main_nav").hide();
      this.render();
    },
    events: {
      'submit form': 'submitForm'
    },
    submitForm: function(ev) {
      $.post('/login', $(ev.currentTarget).serialize(), function(data) {
        AppView.prototype.user = data;
        $("#main_nav").show();

      });
      return ev.preventDefault();
    },
    render: function() {
      var template = _.template($("#login_template").html(),{});
      this.$el.html(template);
    }
  })
};

define(views);