var readdir = require('recursive-readdir')
;
exports.local = function(path, next) {
  readdir(path, next);
};