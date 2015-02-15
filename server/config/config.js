var path = require('path'),
  rootPath = path.normalize(__dirname + '/../..'),
  port = process.env.PORT || 3000,
  host = process.env.HOST || 'localhost',
  os = require("os");


var config = {
  root: rootPath,
  app: {
    name: 'excast'
  },
  host: process.env.HOSTNAME || os.hostname(),
  port: port,
  db: process.env.DATABASE_URL || "mongodb://localhost/excast-development",
  thumbnailPath: process.env.THUMBNAIL_PATH || './client/thumbnails/',
  thumbnailUrl: process.env.THUMBNAIL_URL || '/thumbnails/',
  watchPath: path.join(rootPath, 'watch'),
  torrentPath: path.join(rootPath, 'torrents')
};

module.exports = config;
