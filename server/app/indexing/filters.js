exports.samples = function (files) {
  files.forEach(function (file, i) {
    if (file.match(/sample/)) {
      delete files[i]
    }
  });
  return files;
};