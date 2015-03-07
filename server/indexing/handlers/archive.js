var config = require('../../config/config'),
  fs = require('fs'),
  rar = require('node-rar'),
  path = require('path')
;


function extractVideo(archive) {

  var Indexer = require('../indexer'),
    files = rar.list(archive),
    dir = path.dirname(archive);

  files.reduce(function(carry, file) {
    return (carry && fs.existsSync(file));
  }, true);

  //1 or more files from the archive are not extracted
  if(!files) {

    console.log("Extracting ", archive);

    rar.extract(archive, dir);

    files.forEach(function(file) {
      Indexer.pushFile(path.join(dir, file.FileName));
    });
  } else {
    console.log("Skipping ", archive, " all files extracted");
  }
}

module.exports = {
  pattern: /\.(rar|001|zip)$/,
  process: extractVideo
};