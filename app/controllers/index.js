var mongoose = require('mongoose'),
    Video = mongoose.model('Video'),
    path = require('path'),
    fs = require('fs'),
    config = require('../../config/config'),
    ffmpeg = require('fluent-ffmpeg');

exports.index = function (req, res) {
    Video.find(function (err, videos) {
        if (err) throw new Error(err);
        res.render('home/index', {
            title: 'Media Home',
            videos: videos
        });
    });
};

exports.refresh = function (req, res) {
    //Video.collection.drop();
    indexDir(config.indexPath);
    res.redirect(302, '/');
};

function indexDir(file, depth) {
    if(depth == undefined) depth = 0;
    console.log("Scanning: " + file);
    fs.stat(file, function(err, stat) {
        if(err) {
            console.log("Error: ", err);
            return;
        }

        if(stat.isFile() && file.match(/\.(mp4|mkv)$/)) {

            var name = path.basename(file),
                fileRecord = new Video({
                name: name,
                path: file,
                url: config.urlBase + path.relative(config.indexPath,file)
            });

            Video.find(function (err, results) {
                if (err) {
                    console.log("Error: ", err);
                } else {
                    if (results.length == 0) {
                        console.log("Creating Video record for ", file);
                        generateThumbnail(fileRecord, function(err, url) {
                            if(!err) {
                                console.log('Thumbnail created at ' + url);
                                fileRecord.thumbnail = url;
                                fileRecord.save(function (err) {
                                    if (err)
                                        console.log("Error: " + err);
                                });
                            } else {
                                console.log("Error generating thumbnail", err);
                            }
                        });
                    }
                }
            });
        } else if (stat.isDirectory() && depth < 2){
            var files = fs.readdirSync(file);
            files.forEach(function (f) {
                indexDir(file + "/" + f, depth+1);
            });
        }
    });
}

function generateThumbnail(file, cb) {
    var proc = new ffmpeg({
        source: file.path
    })
        .withSize('320x180')
        .takeScreenshots(1, config.thumbnailPath, function(err, filenames) {
            if(err) {
                console.log("Error processing: " + file.path);
                console.log(err);
                cb(err, null);
            } else {
                cb(null, config.thumbnailUrl + filenames[0]);
            }
        });

}