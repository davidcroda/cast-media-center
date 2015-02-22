var path = require('path'),
  rootPath = path.normalize(__dirname + '/../..'),
  port = process.env.PORT || 3000,
  host = process.env.HOST || 'localhost',
  os = require("os");


var config = {
  root: rootPath,
  app: {
    name: 'cast-media-center'
  },
  host: process.env.HOSTNAME || os.hostname(),
  port: port,
  db: process.env.DATABASE_URL || "mongodb://localhost/cast-media-center",
  watchPath: path.join(rootPath, 'watch'),
  torrentPath: path.join(rootPath, 'torrents')
};

module.exports = config;
