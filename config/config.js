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
    db: process.env.MONGOHQ_URL,
    indexPath: '/home/dave/ftp/torrents/downloads/',
    thumbnailPath: '/home/dave/ftp/www/thefreeman.montauk.seedboxes.cc/thumbnails/',
    thumbnailUrl: 'http://thefreeman.montauk.seedboxes.cc/thumbnails/',
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
