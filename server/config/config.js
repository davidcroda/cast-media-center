var path = require('path'),
  rootPath = path.normalize(__dirname + '/../..'),
  port = process.env.PORT || 3000,
  host = process.env.HOST || 'localhost',
  os = require("os");


var config = {
  root: rootPath,
  defaultUser: 'dave',
  defaultPassword: 'changethis',
  app: {
    name: 'cast-media-center'
  },
  host: process.env.HOSTNAME || os.hostname(),
  port: port,
  db: process.env.DATABASE_URL || "mongodb://localhost/cast-media-center",
  downloadDir: path.join(rootPath, 'torrents')
};

//Create initial secret file if it doesn't exist
try {
  config.secret = require('./secret.json').secret;
} catch(err) {
  var crypto = require('crypto');
  crypto.randomBytes(256, function(err, random) {
    if (err) { throw err; }
    for(var i = 1000; i > 0; i--) {
      random = crypto.createHash('sha256').update(random).digest();
    }

    random = random.toString('hex');

    require('fs').writeFileSync(path.join(rootPath,'server','config','secret.json'),JSON.stringify({secret: random}));
    config.secret = random;
  });
}

module.exports = config;
