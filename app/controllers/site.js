var mongoose = require('mongoose'),
    Video = mongoose.model('Video'),
    fs = require('fs');

exports.index = function (req, res) {
    Video.find(function (err, videos) {
        if (err) throw new Error(err);
        res.render('index', {
            title: 'Media Home',
            videos: videos
        });
    });
};

exports.api = function(req, res) {
    Video.find(function (err, videos) {
        if (err) throw new Error(err);
        res.json({
            videos: videos
        });
    });
};

exports.delete = function(req, res) {
  console.log(req.params);
  if(req.params.id) {
    console.log('delete ' + req.params.id);
    Video.find({
      _id: req.params.id
    }, function(err, videos) {
      console.log(videos);
      if(err) throw err;
      for(var i in videos) {
        fs.unlink(videos[i].path, function(err) {
          if(err) console.log(err);
          videos[i].remove();
          res.send(200);
        });
      }
    });
  }
};