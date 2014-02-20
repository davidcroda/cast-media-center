var mongoose = require('mongoose'),
    Video = mongoose.model('Video'),
    path = require('path'),
    fs = require('fs'),
    config = require('../../config/config'),
    ffmpeg = require('fluent-ffmpeg'),
    sizes = {
        Small: '480x270',
        Large: '780x1200'
    },
    Inotify = require('inotify').Inotify;

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

var data = {}; //used to correlate two events

exports.callback = function(event) {
  var mask = event.mask;
  var type = mask & Inotify.IN_ISDIR ? 'directory ' : 'file ';
  event.name ? type += ' ' + event.name + ' ': ' ';

  //the porpuse of this hell of 'if'
  //statements is only illustrative.

  if(mask & Inotify.IN_ACCESS) {
    console.log(type + 'was accessed ');
  } else if(mask & Inotify.IN_MODIFY) {
    console.log(type + 'was modified ');
  } else if(mask & Inotify.IN_OPEN) {
    console.log(type + 'was opened ');
  } else if(mask & Inotify.IN_CLOSE_NOWRITE) {
    console.log(type + ' opened for reading was closed ');
  } else if(mask & Inotify.IN_CLOSE_WRITE) {
    console.log(type + ' opened for writing was closed ');
  } else if(mask & Inotify.IN_ATTRIB) {
    console.log(type + 'metadata changed ');
  } else if(mask & Inotify.IN_CREATE) {
    console.log(type + 'created');
  } else if(mask & Inotify.IN_DELETE) {
    console.log(type + 'deleted');
  } else if(mask & Inotify.IN_DELETE_SELF) {
    console.log(type + 'watched deleted ');
  } else if(mask & Inotify.IN_MOVE_SELF) {
    console.log(type + 'watched moved');
  } else if(mask & Inotify.IN_IGNORED) {
    console.log(type + 'watch was removed');
  } else if(mask & Inotify.IN_MOVED_FROM) {
    data = event;
    data.type = type;
  } else if(mask & Inotify.IN_MOVED_TO) {
    if( Object.keys(data).length &&
      data.cookie === event.cookie) {
      console.log(type + ' moved to ' + data.type);
      data = {};
    }
  }
}