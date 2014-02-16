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
}