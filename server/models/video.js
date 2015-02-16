// Example model

var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 *  { "subtitle" : "Fusce id nisi turpis. Praesent viverra bibendum semper. Donec tristique, orci sed semper lacinia, quam erat rhoncus massa, non congue tellus est quis tellus. Sed mollis orci venenatis quam scelerisque accumsan. Curabitur a massa sit amet mi accumsan mollis sed et magna. Vivamus sed aliquam risus. Nulla eget dolor in elit facilisis mattis. Ut aliquet luctus lacus. Phasellus nec commodo erat. Praesent tempus id lectus ac scelerisque. Maecenas pretium cursus lectus id volutpat.",
              "sources" : [ "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/GoogleIO-2014-CastingToTheFuture.mp4" ],
              "thumb" : "images/ToTheFuture-480x270.jpg",
	          "image-480x270" : "images_480x270/ToTheFuture2-480x270.jpg",
              "image-780x1200" : "images_780x1200/ToTheFuture-789x1200.jpg",
              "title" : "Casting To The Future",
              "studio" : "Google IO - 2014",
              "tracks":[{ "id" : "1", "type" : "text", "subtype" : "captions", "contentId":"https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/GoogleIO-2014-CastingToTheFuture2-en.vtt", "name": "English Subtitle", "language" : "en-US"}]
            },
 */

var TrackSchema = new Schema({
  id: Number,
  type: String,
  subtype: String,
  contentId: String,
  name: String,
  language: String
});

mongoose.model('Track', TrackSchema);

var VideoSchema = new Schema({
  title: String,
  subtitle: String,
  path: String,
  duration: 0,
  source: String,
  thumbnailSmall: String,
  thumbnailLarge: String,
  vcodec: String,
  acodec: String,
  date: Date,
  tracks: [TrackSchema],
  transcoding: {
    type: Boolean,
    default: false
  },
  watched: Boolean
}, {
  toJSON: {
    virtuals: true
  }
});

mongoose.model('Video', VideoSchema);
