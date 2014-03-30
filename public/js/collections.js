var collections = {
  Videos: Backbone.Collection.extend({
    initialize: function (model) {
      this.model = model;
      this.sort = "-date";
      this.urlBase = "/api/video?sort=";
      this.url = this.urlBase + this.sort;
    },
    error: onError,
    parse: function (res) {
      return res.video;
    }
  }),

  Sources: Backbone.Collection.extend({
    initialize: function (model) {
      this.model = model;
    },
    url: "/api/source",
    error: onError,
    parse: function (res) {
      return res.source;
    }
  })
};


function onError(collection, resp, options) {
  console.log(collection, resp, options);
}

define(collections);