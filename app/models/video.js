// Example model

var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var VideoSchema = new Schema({
  title: String,
  path: String,
  duration: 0,
  sources: [String],
  thumbnailSmall: String,
  thumbnailLarge: String,
  selected: Boolean,
  watched: Boolean
});

VideoSchema.virtual('date')
  .get(function () {
    return this._id.getTimestamp();
  });

mongoose.model('Video', VideoSchema);
