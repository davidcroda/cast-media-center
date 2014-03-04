var models = {
  Video: Backbone.Model.extend({
    urlRoot: '/api/video',
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
  })
};

define(models);