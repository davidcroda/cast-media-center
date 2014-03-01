// Example model

var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var VideoSchema = new Schema({
  name: String,
  path: String,
  sources: [String],
  thumbnailSmall: String,
  thumbnailLarge: String,
  watched: Boolean
});

VideoSchema.virtual('date')
  .get(function () {
    return this._id.getTimestamp();
  });

mongoose.model('Video', VideoSchema);
