var models = require('./models');

var collections = {
  Videos: Backbone.Collection.extend({
    initialize: function() {
      this.sort = "-date";
      this.urlBase = "/api/video?sort=";
      this.url = this.urlBase + this.sort;
    },
    model: models.Video,
    parse: function(res) {
      return res.video;
    }
  }),
  Sources: Backbone.Collection.extend({
    model: models.Source,
    url: "/api/source",
    parse: function(res) {
      return res.source;
    }
  })
};

define(collections);