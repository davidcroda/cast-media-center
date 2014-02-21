var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var Token = new Schema({
  userId: String,
  token: String
});

module.exports = mongoose.model('Token', Token);