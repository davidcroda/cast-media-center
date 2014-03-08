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
  videoCodec: String,
  audioCode: String,
  date: Date,
  selected: Boolean,
  watched: Boolean
}, {
  toJSON: {
    virtuals: true
  }
});

mongoose.model('Video', VideoSchema);
