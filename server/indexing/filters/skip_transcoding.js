var transcoder = require('../../utils/transcoder');

module.exports = function(file) {
  return !transcoder.isTranscoding(file);
};