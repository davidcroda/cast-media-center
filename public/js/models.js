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
      date: '',
      selected: false
    },
    title: String,
    path: String,
    duration: 0,
    sources: [String],
    thumbnailSmall: String,
    thumbnailLarge: String,
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