var path = require('path'),
  rootPath = path.normalize(__dirname + '/../..'),
  env = process.env.NODE_ENV || 'development',
  port = process.env.PORT || 3000,
  host = process.env.HOST || 'localhost'

var config = {
  development: {
    root: rootPath,
    app: {
      name: 'excast'
    },
    port: port,
    db: process.env.DATABASE_URL || "mongodb://localhost/excast-development",
    thumbnailPath: process.env.THUMBNAIL_PATH || './public/thumbnails/',
    thumbnailUrl: process.env.THUMBNAIL_URL || 'http://daveroda.com/thumbnails/',
    watchPath: path.normalize(path.join(rootPath,'..','watch'))
  },

  VM: {
    root: rootPath,
    app: {
      name: 'excast'
    },
    port: port,
    db: process.env.DATABASE_URL || "mongodb://localhost/excast-development",
    thumbnailPath: process.env.THUMBNAIL_PATH || './public/thumbnails/',
    thumbnailUrl: process.env.THUMBNAIL_URL || 'http://' + host + ':' + port + '/thumbnails/',
    watchPath: path.normalize(path.join(rootPath,'..','watch'))
  },

  production: {
    root: rootPath,
    app: {
      name: 'excast'
    },
    port: process.env.PORT || 3000,
    db: 'mongodb://localhost/excast-production',
    watchPath: path.normalize(path.join(rootPath,'..','watch'))
  }
};

module.exports = config[env];
