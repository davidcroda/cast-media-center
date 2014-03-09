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
      transcoding: false
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
    initialize: function(options) {
      this.id = options._id;
//        this.on('change:selected',function(model, value, options) {
//          console.log(model);
//          console.log(value);
//          console.log(options);
//          model.save();
//        });
    }
  })
};

define(models);