exports.index = function(files) {
  files.forEach(function(i, file) {
    if(file.match(/sample/)) {
      delete files[i]
    }
  });
  return files;
};