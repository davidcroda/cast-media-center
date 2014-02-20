var mongoose = require('mongoose'),
    Video = mongoose.model('Video');

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
  if(req.params.id) {
    Video.find({
      id: req.params.id
    }, function(err, videos) {
      if(err) throw err;
      for(var i in videos) {
        fs.unlink(videos[i].path, function(err) {
          if(err) throw err;
          videos[i].delete();
        });
      }
    });
  }
};