var mongoose = require('mongoose'),
    Video = mongoose.model('Video'),
    path = require('path'),
    fs = require('fs'),
    config = require('../../config/config'),
    ffmpeg = require('fluent-ffmpeg'),
    sizes = {
        Small: '480x270',
        Large: '780x1200'
    };

exports.index = function (req, res) {
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

            var name = path.basename(file);

            Video.find({
                name: name
            }, function (err, results) {
                if (err) {
                    console.log("Error: ", err);
                } else {
                    if (results.length == 0) {
                        var fileRecord = new Video({
                            name: name,
                            path: file,
                            sources: [config.urlBase + path.relative(config.indexPath,file)]
                        });
                        console.log("Creating Video record for ", file);
                        for (var size in sizes) {
                            console.log("Creating Thumbnail size: " + sizes[size]);
                            generateThumbnail(fileRecord, size, sizes[size], function(err, sizeName, url) {
                                if(!err) {
                                    console.log('Thumbnail created ' + sizeName + ' thumbnail at ' + url);
                                    fileRecord['thumbnail'+ sizeName] = url;
                                    fileRecord.save(function (err) {
                                        if (err)
                                            console.log("Error: " + err);
                                    });
                                } else {
                                    console.log("Error generating thumbnail", err);
                                }
                            });
                        }
                    } else {
                        console.log("Found existing video", results);
                    }
                }
            });
        } else if (stat.isDirectory() && depth < 2){
            var files = fs.readdirSync(file);
            files.forEach(function (f) {
                indexDir(path.join(file,f), depth+1);
            });
        }
    });
}

function generateThumbnail(file, sizeName, size, cb) {
    var proc = new ffmpeg({
        source: file.path
    })
        .withSize(size)
        .takeScreenshots({
            count: 1,
            filename: "%b-%w-%h"
        }, config.thumbnailPath, function(err, filenames) {
            if(err) {
                console.log("Error processing: " + file.path);
                console.log(err);
                cb(err, null);
            } else {
                cb(null, sizeName, config.thumbnailUrl + filenames[0]);
            }
        });

}