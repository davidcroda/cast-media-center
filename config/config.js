var path = require('path'),
  rootPath = path.normalize(__dirname + '/..'),
  env = process.env.NODE_ENV || 'development';

var config = {
  development: {
    root: rootPath,
    app: {
      name: 'excast'
    },
    port: process.env.PORT || 3000,
    db: process.env.DATABASE_URL || "mongodb://localhost/excast-development",
    indexPath: process.env.DATABASE_URL || '/home/dave/ftp/torrents/downloads/',
    thumbnailPath: process.env.THUMBNAIL_PATH || '/home/dave/ftp//www/thefreeman.montauk.seedboxes.cc/thumbnails/',
    thumbnailUrl: process.env.THUMBNAIL_URL || 'http://thefreeman.montauk.seedboxes.cc/thumbnails/',
    urlBase: process.env.URL_BASE
  },

  staging: {
    root: rootPath,
    app: {
      name: 'excast'
    },
    port: process.env.PORT || 3000,
    db: process.env.DATABASE_URL || "mongodb://192.168.1.7/excast-development",
    indexPath: process.env.DATABASE_URL || '/home/dave/mount/torrents/downloads/',
    thumbnailPath: process.env.THUMBNAIL_PATH || '/home/dave/mount/www/thefreeman.montauk.seedboxes.cc/thumbnails/',
    thumbnailUrl: process.env.THUMBNAIL_URL || 'http://thefreeman.montauk.seedboxes.cc/thumbnails/',
    urlBase: process.env.URL_BASE
  },

  test: {
    root: rootPath,
    app: {
      name: 'excast'
    },
    port: process.env.PORT || 3000,
    db: 'mongodb://localhost/excast-test'
  },

  production: {
    root: rootPath,
    app: {
      name: 'excast'
    },
    port: process.env.PORT || 3000,
    db: 'mongodb://localhost/excast-production'
  }
};

module.exports = config[env];
