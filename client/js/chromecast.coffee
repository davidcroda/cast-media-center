class Chromecast

  constructor: ($scope)->
    @init = false
    @appSession = null
    @mediaSession = null
    @queue = null
    @video = null
    @timer = null
    @currentTime = 0
    @timeouts = {}
    @$scope = $scope
    if !chrome.cast || !chrome.cast.isAvailable
      setTimeout @initializeCastApi, 1000

  bindControls: =>
    excast = this
    @play = $('#play')
    @play.bind 'click', @playMedia
    @stop = $('#stop')
    @stop.bind 'click', @stopMedia

    $('.progress').bind 'click', (ev) ->
      x = ev.offsetX
      width = $(this).width()
      console.log(x, width)
      percent = x / width
      excast.seekMedia percent

    $('#search').bind 'keyup', =>
      query = ".*" + $("#search").val().toLowerCase() + ".*"
      $('.video-title').each (index, item) ->
        item = $(item);
        if item.html().toLowerCase().match(query)
          item.parents('.col-md-3').show()
        else
          item.parents('.col-md-3').hide()
      $('#video-container').isotope 'reLayout'


  #playback functions

  transcodeVideo: (video) =>

    $.post '/api/video/' + video.id, (data)=>
      if data.video
        clearTimeout @timeouts[video.path]
        return data.video

      percent = data.progress * 100
      video.state = "transcoding"
      video.progress = percent;

      clearTimeout(@timeouts[video.path])

      @timeouts[video.path] = setTimeout ()=>
        @transcodeVideo video;
      , 15000

      return false

  checkMedia: (video) =>
    if video.vcodec != 'h264' || video.acodec != 'aac'
      return @transcodeVideo(video);
    else
      video.url = window.location.protocol + "//" + window.location.hostname + "/load/" + video.id
    return video

  loadMedia: (video) =>

    #video = @checkMedia(video)

    @video = video;

    video.watched = true;

    if video
      console.log "loadMedia: ", video
      if !@appSession
        @loadApp =>
          @loadMedia video
        return false

      @$scope.$apply =>
        @$scope.currentMedia = video
        @$scope.state = "playing"

      console.log("loading... " + video.url);
      mediaInfo = new chrome.cast.media.MediaInfo(video.url);
      mediaInfo.contentType = 'video/mp4'
      mediaInfo.customData =
        title: video.title,
        thumbnail: video.thumbnailLarge
      request = new chrome.cast.media.LoadRequest mediaInfo
      request.autoplay = true;
      request.currentTime = 0;

      @appSession.loadMedia request,
        @onMediaDiscovered,
        @onMediaError

  playMedia: =>
    if !@mediaSession
      return false

    if @mediaSession.playerState == "PLAYING"
      clearTimeout(@timer)
      @timer = null
      @mediaSession.pause null, @updateMediaDisplay, @onError
      console.log('Play paused')
    else
      @timer = setTimeout(@updateProgress, 1000)
      @mediaSession.play null, @updateMediaDisplay, @onError
      console.log('Play started')

  seekMedia: (percent)=>
    clearTimeout(@timer)
    @timer = null
    position = percent * @mediaSession.media.duration;
    console.log("Seeking to position " + position);
    request = new chrome.cast.media.SeekRequest();
    request.currentTime = position;
    @mediaSession.seek(request,
      @updateMediaDisplay,
      @onError);

  stopMedia: =>
    if !@mediaSession
      console.log("No media session to stop")
      return false

    $("#control-nav").hide()
    clearTimeout(@timer)
    @mediaSession.stop null, @updateMediaDisplay, @onError

  #Ttial Setup

  initializeCastApi: =>
    sessionRequest = new chrome.cast.SessionRequest "E4815CDE"
    apiConfig = new chrome.cast.ApiConfig sessionRequest, @sessionListener, @receiverListener
    chrome.cast.initialize(apiConfig, @onInitSuccess, @onError)

  onMediaDiscovered: (session)=>
    console.log "onMediaDiscovered:", session
    if session && session.media
      @mediaSession = session
      session.addUpdateListener(@updateMediaDisplay)
      @updateMediaDisplay()

  onStopSuccess: (data) =>
    console.log("Session stopped")
    @appSession = @mediaSession = null
    console.log(data)

  onStopError: (error) =>
    console.log(error)

  onMediaError: (error) =>
    console.log(error)

  updateMediaDisplay: =>
    if @mediaSession
      @currentTime = @mediaSession.currentTime
      console.log 'Overrode @currentTime with @mediaSession.currentTime of ', @mediaSession.currentTime
      #$('.current-media').html @mediaSession.media.customData.title
      #$('.thumbnail').attr 'src', @mediaSession.media.customData.thumbnail
      @updateProgressBar()
      @updateControls()

  updateProgressBar: =>
    if @mediaSession
      progressWidth = $(".progress").width()
      percent = @currentTime / @mediaSession.media.duration
      $("#progress").width((progressWidth * percent))
      $(".currentTime").html(@formatTime(@currentTime) + "/" + @formatTime(@mediaSession.media.duration))

  formatTime: (duration)->
    duration = Math.floor duration
    hours = Math.floor duration / 3600
    minutes = Math.floor (duration - (hours * 3600)) / 60
    seconds = duration % 60

    if hours < 1
      hours = "00"
    if minutes < 1
      minutes = "00"
    if seconds < 1
      seconds = "00"
    return hours + ":" + minutes + ":" + seconds

  updateProgress: =>
    @currentTime++
    console.log("updateProgress: ", @currentTime)
    @updateProgressBar()
    @timer = setTimeout(@updateProgress, 1000)

  updateControls: () =>
    console.log("Player State: ", @mediaSession.playerState)
    if @mediaSession.playerState == "BUFFERING"
      $('.progress').addClass('active').addClass('progress-striped')
    else
      $('.progress').removeClass('active').removeClass('progress-striped')
      if @mediaSession.playerState == "PLAYING"
        @stop.removeClass('disabled')
        @play.removeClass('disabled')
        @play.removeClass('glyphicon-play').addClass('glyphicon-pause')
        if !@timer
          @timer = setTimeout(@updateProgress, 1000)
      else if @mediaSession.playerState == "PAUSED"
        @stop.removeClass('disabled')
        @play.removeClass('disabled');
        @play.removeClass('glyphicon-pause').addClass('glyphicon-play')
      else
        @play.addClass('disabled')
        @stop.addClass('disabled')

  onInitSuccess: =>
    @init = true
    @bindControls()

  onError: (e)=>
    console.log 'Error: ', e

  sessionListener: (e)=>
    console.log "Received Session: ", e
    @appSession = e;
    if !@$scope.currentMedia
      console.log("Stopping existing session");
      @appSession.stop(@onStopSuccess, @onStopError)
    else
      if e.media.length > 0
        @onMediaDiscovered e.media[0]
      @appSession.addMediaListener @onMediaDiscovered
      @appSession.addUpdateListener @sessionUpdateListener

  sessionUpdateListener: (alive)=>
    console.log (alive ? 'Session Updated: ': 'Session Removed: ') + @appSession.sessionId;
    if !isAlive
      @appSession = null
      @mediaSession = null

  receiverListener: (e)=>
    if e == 'available'
      console.log "receiver found"
    else
      console.log e


  #Launch the App

  loadApp: (cb) =>
    console.log "loadApp"
    #if !@appSession && @init
    chrome.cast.requestSession @onRequestSessionSuccess.bind(this, cb), @onRequestSessionError

  onRequestSessionSuccess: (cb, session) =>
    @appSession = session
    cb()

  onRequestSessionError: (e) ->
    console.log "Launch error: ", e


angular.module 'chromecast', []
  .factory 'chromecast', ()->
    return Chromecast