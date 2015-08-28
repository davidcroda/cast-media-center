var http = require('http'),
  util = require('util'),
  EventEmitter = require("events").EventEmitter,
  config = require('../config/config'),
  url = require('url')

;

var Transmission = function() {

  this.apiBase = "http://127.0.0.1:9091/transmission/rpc";
  this.sessionId = "";

};

util.inherits(Transmission, EventEmitter);

Transmission.prototype.request = function(method, args, cb) {

  var _this = this;

  var apiUrl = url.parse(this.apiBase);

  var body = JSON.stringify({
    "method": method,
    "arguments": args
  });

  var request = new http.ClientRequest({
    hostname: apiUrl.hostname,
    port: apiUrl.port,
    path: apiUrl.path,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(body),
      "X-Transmission-Session-Id": _this.sessionId
    }
  });

  request.on('response', function(resp) {

      var data = "";
      resp.on('data', function(chunk) {
        data += chunk.toString();
      });

      resp.on('end', function() {
        if(resp.statusCode == 409) {
          _this.sessionId = resp.headers['x-transmission-session-id'];
          return _this.request(method, args, cb);

        } else if (resp.statusCode == 200) {

          var result = JSON.parse(data);

          if(result.result == 'success') {
            cb(null, result.arguments);
          } else {
            cb(new Error(result.result));
          }
        } else {
          cb(new Error(data));
        }

      });
  });

  request.on('error', function(error) {
    console.log(error);
  });

  request.end(body);
};

Transmission.prototype.getTorrents = function(cb, fields) {

  if(typeof fields == "undefined") {
    fields = ['id','name','peersConnected','eta','trackerStats','percentDone','rateDownload','rateUpload','status','files','totalSize','uploadRatio'];
  }

  this.request("torrent-get", {
    "fields": fields
  }, cb);

};

Transmission.prototype.addTorrent = function(torrent, cb) {

  var args = {
    "download-dir": config.downloadDir
  };

  if (typeof torrent == "string") {
    args.filename = torrent;
  } else if (typeof torrent == Buffer) {
    args.metainfo = torrent.toString("base64");
  } else {
    throw new Error("Invalid torrent specified");
  }

  return this.request("torrent-add", args, cb);

};


Transmission.prototype.deleteTorrent = function(ids, deleteLocal, cb) {

  if(typeof deleteLocal == "function") {
    cb = deleteLocal;
    deleteLocal = false;
  }

  if(typeof ids != Array) {
    ids = parseInt(ids);
  } else {
    ids.map(function(id) {
      return parseInt(id);
    });
  }

  var args = {
    "ids": ids,
    "delete-local-data": deleteLocal
  };

  console.log(args);

  return this.request("torrent-remove", args, cb);

};

var transmission = new Transmission();

module.exports = transmission;
