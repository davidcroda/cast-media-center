var mongoose = require('mongoose'),
  Video = mongoose.model('Video'),
  fs = require('fs');

exports.index = function (req, res) {
  Video.find(function (err, videos) {
    if (err) throw new Error(err);
    res.json(videos);
  }).sort('+title');
};

exports.get = function (req, res) {
  if(req.params.id) {
    Video.find({
      _id: id
    }, function (err, videos) {
      if (err) throw new Error(err);
      res.json(Video.attributes);
    });
  } else {
    res.send(404);
  }
};

exports.delete = function (req, res) {
  if (req.params.id) {
    console.log('delete ' + req.params.id);
    Video.find({
      _id: req.params.id
    }, function (err, videos) {
      if (err) throw err;
      for (var i in videos) {
        fs.unlink(videos[i].path, function (err) {
          if (err) console.log(err);
          videos[i].remove();
          res.json(videos[i]);
        });
      }
    });
  }
};

exports.update = function(req, res) {
  var _id = req.body._id;
  delete req.body._id;
  Video.update({
    _id: _id
  },req.body, function(err, affectedRows) {
    if(err) res.send(500, err);
    res.send(200, affectedRows);
  });
};