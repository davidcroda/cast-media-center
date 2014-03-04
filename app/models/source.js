var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var SourceSchema = new Schema({
  path: String,
  url: String,
  thumbnailPath: String,
  thumbnailUrl: String,
  type: String
});

mongoose.model('Source', SourceSchema);
