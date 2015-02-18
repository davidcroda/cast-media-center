var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var Token = new Schema({
  userId: String,
  token: String,
  expiresAt: {
    type: Date,
    expires: 0
  }
});

module.exports = mongoose.model('Token', Token);