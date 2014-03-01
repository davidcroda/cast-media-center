var cryptojs = require('crypto-js'),
  http = require('http');

var apiBase = 'usher.twitch.tv',
  tokenPath = "/stream/iphone_token/{{CHANNEL}}.json?type=iphone&connection=wifi&allow_cdn=true",
  streamPath = "/stream/multi_playlist/{{CHANNEL}}.m3u8?hd=true&allow_cdn=true&token={{TOKEN}}",
  secretKey = "Wd75Yj9sS26Lmhve";

function getStreamUrl(channel, callback) {
  var options = {
    host: apiBase,
    port: 80,
    path: tokenPath.replace('{{CHANNEL}}', channel)
  };
  http.get(options, function (resp) {
    resp.on('data', function (data) {
      var json = JSON.parse(data);
      var token = json[0].token;
      var hash = cryptojs.HmacSHA1(token, secretKey);
      hash += ":" + encodeURIComponent(token);
      streamPath = streamPath.replace('{{CHANNEL}}', channel)
        .replace('{{TOKEN}}', hash);
      callback(streamPath);
    });
  });
}

exports.view = function (req, res) {
  if (req.params.channel) {
    var url = getStreamUrl(req.params.channel, function (url) {
      console.log(url);
      res.redirect(301, "http://" + apiBase + url);
    });
  }
};