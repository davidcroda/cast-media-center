module.exports = function(file) {
  return (file.match(/(mp4|mkv|xvid|divx|mpeg|mpg|avi|x264|hdtv)/i) != null);
};