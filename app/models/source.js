var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var SourceSchema = new Schema({
  path: String,
  baseUrl: String,
  type: String
});

mongoose.model('Source', SourceSchema);
