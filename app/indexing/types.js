/**
 * Each type should export a function matching its name. This function should take a *path*, and a *callback*.
 * It should call *callback* with a list of files at *path*
 */

var readdir = require('recursive-readdir')
  ;
exports.local = function (path, next) {
  readdir(path, next);
};