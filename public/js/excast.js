// Generated by CoffeeScript 1.6.3
(function() {
  var Excast;

  Excast = (function() {
    function Excast(applicationId) {
      this.applicationId = applicationId;
      if (!chrome.cast || !chrome.cast.isAvailable) {
        setTimeout(this.initializeCastApi, 1000);
      }
    }

    Excast.prototype.initializeCastApi = function() {
      var apiConfig, sessionRequest;
      sessionRequest = new chrome.cast.SessionRequest(this.applicationId);
      apiConfig = new chrome.cast.ApiConfig(sessionRequest, sessionListener, receiverListener);
      return chrome.cast.initialize(apiConfig, this.onInitSuccess, this.onError);
    };

    Excast.prototype.onMediaDiscovered = function(session) {
      if (session && session.media) {
        if (session.media.length > 0) {
          this.currentSession = session.media[0];
        } else {
          this.currentSession = session;
        }
      }
      return console.log(this.currentSession);
    };

    Excast.prototype.onInitSuccess = function() {
      return console.log('init success');
    };

    Excast.prototype.onError = function(e) {
      return console.log('Error: ', e);
    };

    Excast.prototype.sessionListener = function(e) {
      console.log("Received new Session ID: " + e.sessionId);
      console.log(e);
      return this.onMediaDiscovered(e);
    };

    Excast.prototype.receiverListener = function(e) {
      if (e === 'available') {
        return console.log("receiver found");
      } else {
        return console.log(e);
      }
    };

    return Excast;

  })();

  $(function() {
    var excast;
    return excast = new Excast(chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID);
  });

}).call(this);

/*
//@ sourceMappingURL=excast.map
*/
