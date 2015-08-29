(function() {
  var Chromecast,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  Chromecast = (function() {
    function Chromecast() {
      this.onRequestSessionSuccess = bind(this.onRequestSessionSuccess, this);
      this.loadApp = bind(this.loadApp, this);
      this.receiverListener = bind(this.receiverListener, this);
      this.sessionUpdateListener = bind(this.sessionUpdateListener, this);
      this.sessionListener = bind(this.sessionListener, this);
      this.onError = bind(this.onError, this);
      this.onInitSuccess = bind(this.onInitSuccess, this);
      this.updateControls = bind(this.updateControls, this);
      this.updateProgress = bind(this.updateProgress, this);
      this.updateProgressBar = bind(this.updateProgressBar, this);
      this.updateMediaDisplay = bind(this.updateMediaDisplay, this);
      this.onMediaError = bind(this.onMediaError, this);
      this.onStopError = bind(this.onStopError, this);
      this.onStopSuccess = bind(this.onStopSuccess, this);
      this.onMediaDiscovered = bind(this.onMediaDiscovered, this);
      this.initializeCastApi = bind(this.initializeCastApi, this);
      this.stopMedia = bind(this.stopMedia, this);
      this.seekMedia = bind(this.seekMedia, this);
      this.playMedia = bind(this.playMedia, this);
      this.loadUrl = bind(this.loadUrl, this);
      this.loadMedia = bind(this.loadMedia, this);
      this.checkMedia = bind(this.checkMedia, this);
      this.transcodeVideo = bind(this.transcodeVideo, this);
      this.bindControls = bind(this.bindControls, this);
      this.toggleDebug = bind(this.toggleDebug, this);
      this.setScope = bind(this.setScope, this);
      console.log('Chromecast.js constructor called');
      this.init = false;
      this.appSession = null;
      this.mediaSession = null;
      this.queue = null;
      this.video = null;
      this.timer = null;
      this.currentTime = 0;
      this.timeouts = {};
      this.debug = false;
      window['__onGCastApiAvailable'] = (function(_this) {
        return function(loaded, errorInfo) {
          if (loaded) {
            return _this.initializeCastApi();
          } else {
            return console.log(errorInfo);
          }
        };
      })(this);
    }

    Chromecast.prototype.setScope = function($scope) {
      return this.scope = $scope;
    };

    Chromecast.prototype.toggleDebug = function() {
      return this.debug = !this.debug;
    };

    Chromecast.prototype.bindControls = function() {
      var excast;
      console.log('bindControls');
      excast = this;
      this.play = $('#play');
      this.play.bind('click', this.playMedia);
      this.stop = $('#stop');
      this.stop.bind('click', this.stopMedia);
      $('.progress').bind('click', function(ev) {
        var percent, width, x;
        x = ev.offsetX;
        width = $(this).width();
        console.log(x, width);
        percent = x / width;
        return excast.seekMedia(percent);
      });
      return $('#search').bind('keyup', (function(_this) {
        return function() {
          var query;
          query = ".*" + $("#search").val().toLowerCase() + ".*";
          $('.video-title').each(function(index, item) {
            item = $(item);
            if (item.html().toLowerCase().match(query)) {
              return item.parents('.col-md-3').show();
            } else {
              return item.parents('.col-md-3').hide();
            }
          });
          return $('#video-container').isotope('reLayout');
        };
      })(this));
    };

    Chromecast.prototype.transcodeVideo = function(video) {
      return $.post('/api/video/' + video.id, (function(_this) {
        return function(data) {
          var percent;
          if (data.video) {
            clearTimeout(_this.timeouts[video.path]);
            return data.video;
          }
          percent = data.progress * 100;
          video.state = "transcoding";
          video.progress = percent;
          clearTimeout(_this.timeouts[video.path]);
          _this.timeouts[video.path] = setTimeout(function() {
            return _this.transcodeVideo(video);
          }, 15000);
          return false;
        };
      })(this));
    };

    Chromecast.prototype.checkMedia = function(video) {
      if (video.vcodec !== 'h264' || (video.acodec !== 'aac' && video.acodec !== "mp3")) {
        return this.transcodeVideo(video);
      } else {
        video.url = window.location.protocol + "//" + window.location.hostname + "/load/" + video.id;
      }
      return video;
    };

    Chromecast.prototype.loadMedia = function(video) {
      this.video = video;
      video.watched = true;
      if (video) {
        console.log("loadMedia: ", video);
        if (!this.appSession) {
          this.loadApp((function(_this) {
            return function() {
              return _this.loadMedia(video);
            };
          })(this));
          return false;
        }
        if (this.$scope) {
          this.$scope.$apply((function(_this) {
            return function() {
              _this.$scope.currentMedia = video;
              return _this.$scope.state = "playing";
            };
          })(this));
        }
        console.log("loading... " + video.title);
        return $.post('/api/token').success((function(_this) {
          return function(token) {
            var mediaInfo, request;
            video.url = window.location.protocol + "//" + window.location.hostname + "/load/" + video.id + "?token=" + token.token;
            mediaInfo = new chrome.cast.media.MediaInfo(video.url);
            mediaInfo.contentType = 'video/mp4';
            mediaInfo.customData = {
              title: video.title
            };
            request = new chrome.cast.media.LoadRequest(mediaInfo);
            request.autoplay = true;
            request.currentTime = 0;
            return _this.appSession.loadMedia(request, _this.onMediaDiscovered, _this.onMediaError);
          };
        })(this));
      }
    };

    Chromecast.prototype.loadUrl = function(url) {
      var mediaInfo, request;
      if (!this.appSession) {
        this.loadApp((function(_this) {
          return function() {
            return _this.loadUrl(url);
          };
        })(this));
        return false;
      }
      mediaInfo = new chrome.cast.media.MediaInfo(url);
      mediaInfo.contentType = 'application/xmpeg-url';
      mediaInfo.customData = {
        title: url,
        debug: this.debug
      };
      request = new chrome.cast.media.LoadRequest(mediaInfo);
      request.autoplay = true;
      request.currentTime = 0;
      return this.appSession.loadMedia(request, this.onMediaDiscovered, this.onMediaError);
    };

    Chromecast.prototype.playMedia = function() {
      if (!this.mediaSession) {
        return false;
      }
      if (this.mediaSession.playerState === "PLAYING") {
        clearTimeout(this.timer);
        this.timer = null;
        this.mediaSession.pause(null, this.updateMediaDisplay, this.onError);
        return console.log('Play paused');
      } else {
        this.timer = setTimeout(this.updateProgress, 1000);
        this.mediaSession.play(null, this.updateMediaDisplay, this.onError);
        return console.log('Play started');
      }
    };

    Chromecast.prototype.seekMedia = function(percent) {
      var position, request;
      clearTimeout(this.timer);
      this.timer = null;
      position = percent * this.mediaSession.media.duration;
      console.log("Seeking to position " + position);
      request = new chrome.cast.media.SeekRequest();
      request.currentTime = position;
      return this.mediaSession.seek(request, this.updateMediaDisplay, this.onError);
    };

    Chromecast.prototype.stopMedia = function() {
      if (!this.mediaSession) {
        console.log("No media session to stop");
        return false;
      }
      $("#control-nav").hide();
      clearTimeout(this.timer);
      return this.mediaSession.stop(null, this.updateMediaDisplay, this.onError);
    };

    Chromecast.prototype.initializeCastApi = function() {
      var apiConfig, sessionRequest;
      sessionRequest = new chrome.cast.SessionRequest("A37D6DB4");
      apiConfig = new chrome.cast.ApiConfig(sessionRequest, this.sessionListener, this.receiverListener);
      return chrome.cast.initialize(apiConfig, this.onInitSuccess, this.onError);
    };

    Chromecast.prototype.onMediaDiscovered = function(session) {
      console.log("onMediaDiscovered:", session);
      if (session && session.media) {
        this.mediaSession = session;
        session.addUpdateListener(this.updateMediaDisplay);
        return this.updateMediaDisplay();
      }
    };

    Chromecast.prototype.onStopSuccess = function(data) {
      console.log("Session stopped");
      this.appSession = this.mediaSession = null;
      return console.log(data);
    };

    Chromecast.prototype.onStopError = function(error) {
      return console.log("onStopError", error);
    };

    Chromecast.prototype.onMediaError = function(error) {
      return console.log("onMediaError", error);
    };

    Chromecast.prototype.updateMediaDisplay = function() {
      if (this.mediaSession) {
        this.currentTime = this.mediaSession.currentTime;
        console.log('Overrode @currentTime with @mediaSession.currentTime of ', this.mediaSession.currentTime);
        this.updateProgressBar();
        return this.updateControls();
      }
    };

    Chromecast.prototype.updateProgressBar = function() {
      var percent, progressWidth;
      if (this.mediaSession) {
        progressWidth = $(".progress").width();
        percent = this.currentTime / this.mediaSession.media.duration;
        $("#progress").width(progressWidth * percent);
        return $(".currentTime").html(this.formatTime(this.currentTime) + "/" + this.formatTime(this.mediaSession.media.duration));
      }
    };

    Chromecast.prototype.formatTime = function(duration) {
      var hours, minutes, seconds;
      duration = Math.floor(duration);
      hours = Math.floor(duration / 3600);
      minutes = Math.floor((duration - (hours * 3600)) / 60);
      seconds = duration % 60;
      if (hours < 1) {
        hours = "00";
      }
      if (minutes < 1) {
        minutes = "00";
      }
      if (seconds < 1) {
        seconds = "00";
      }
      return hours + ":" + minutes + ":" + seconds;
    };

    Chromecast.prototype.updateProgress = function() {
      this.currentTime++;
      console.log("updateProgress: ", this.currentTime);
      this.updateProgressBar();
      return this.timer = setTimeout(this.updateProgress, 1000);
    };

    Chromecast.prototype.updateControls = function() {
      console.log("Player State: ", this.mediaSession.playerState);
      if (this.mediaSession.playerState === "BUFFERING") {
        return $('.progress').addClass('active').addClass('progress-striped');
      } else {
        $('.progress').removeClass('active').removeClass('progress-striped');
        if (this.mediaSession.playerState === "PLAYING") {
          this.stop.removeClass('disabled');
          this.play.removeClass('disabled');
          this.play.removeClass('glyphicon-play').addClass('glyphicon-pause');
          if (!this.timer) {
            return this.timer = setTimeout(this.updateProgress, 1000);
          }
        } else if (this.mediaSession.playerState === "PAUSED") {
          this.stop.removeClass('disabled');
          this.play.removeClass('disabled');
          return this.play.removeClass('glyphicon-pause').addClass('glyphicon-play');
        } else {
          this.play.addClass('disabled');
          return this.stop.addClass('disabled');
        }
      }
    };

    Chromecast.prototype.onInitSuccess = function() {
      console.log('onInitSuccess');
      this.init = true;
      return this.bindControls();
    };

    Chromecast.prototype.onError = function(e) {
      return console.log('Error: ', e);
    };

    Chromecast.prototype.sessionListener = function(e) {
      console.log("Received Session: ", e);
      this.appSession = e;
      if (e.media.length > 0) {
        this.onMediaDiscovered(e.media[0]);
      }
      this.appSession.addMediaListener(this.onMediaDiscovered);
      return this.appSession.addUpdateListener(this.sessionUpdateListener);
    };

    Chromecast.prototype.sessionUpdateListener = function(alive) {
      console.log((alive != null ? alive : {
        'Session Updated: ': 'Session Removed: '
      }) + this.appSession.sessionId);
      if (!isAlive) {
        this.appSession = null;
        return this.mediaSession = null;
      }
    };

    Chromecast.prototype.receiverListener = function(e) {
      if (e === chrome.cast.ReceiverAvailability.AVAILABLE) {
        console.log("receiver found");
        return $('.chromecast-icon').show();
      } else {
        $('.chromecast-icon').hide();
        return console.log(e);
      }
    };

    Chromecast.prototype.loadApp = function(cb) {
      return chrome.cast.requestSession(this.onRequestSessionSuccess.bind(this, cb), this.onRequestSessionError);
    };

    Chromecast.prototype.onRequestSessionSuccess = function(cb, session) {
      console.log("Request session success");
      console.log(session);
      this.appSession = session;
      return cb();
    };

    Chromecast.prototype.onRequestSessionError = function(e) {
      return console.log("Launch error: ", e);
    };

    return Chromecast;

  })();

  angular.module('Chromecast', []).factory('Chromecast', function() {
    return Chromecast;
  });

}).call(this);
