var models = {
  Video: Backbone.Model.extend({
    urlRoot: '/api/video',
    defaults: {
      title: '',
      path: '',
      subtitle: '',
      duration: 0,
      sources: [],
      thumbnailSmall: '',
      thumbnailLarge: '',
      vcodec: '',
      acodec: '',
      date: '',
      transcoding: false,
      watched: false
    },
    title: String,
    path: String,
    subtitle: String,
    duration: Number,
    sources: [String],
    thumbnailSmall: String,
    thumbnailLarge: String,
    vcodec: String,
    acodec: String,
    date: Date,
    transcoding: Boolean,
    watched: Boolean,
    initialize: function (options) {
      this.id = options._id;
      this.on('change:watched', function (model, value, options) {
        model.save();
      });
    }
  }),
  Source: Backbone.Model.extend({
    urlRoot: '/api/source',
    defaults: {
      path: '',
      baseUrl: '',
      type: 'local'
    },
    path: String,
    baseUrl: String,
    type: String,
    initialize: function (options) {
      this.id = options._id;
    }
  })
};

define(models);