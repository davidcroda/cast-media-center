exports.init = function () {
  watch(config.indexDir, function (filename) {
    console.log(filename, ' changed.');
  });
};