var currentMediaSession = null;
var currentVolume = 0.5;
var progressFlag = 1;
var mediaCurrentTime = 0;
var session = null;
var controls = null;
var progressTimeout = null;
var play,
    stop;

$(function() {
    controls = $('.controls');
    stop = $("#stop");
    play = $("#playpauseresume");

    $('.video').bind('dblclick', function() {
        loadMedia($(this).find('.video-title').html(), $(this).attr('data-url'), $(this).find('img.img-thumbnail').attr('src'));
        $('.video').each(function() {
            $(this).removeClass('active');
        });
        $(this).addClass('active');
    });

    $(".progress").bind('click', function(ev) {
        var x = ev.offsetX,
            percent = x / $(this).width() * 100;
        console.log(x);
        console.log($(this).width());
        console.log(percent);
        $("#progress").attr('style','width: ' + percent + '%');
        seekMedia(percent);
    });

    $('#search').bind('keyup', function() {
        var query = ".*" + $("#search").val().toLowerCase() + ".*";
        $('.video-title').each(function(index, item) {
            var item = $(item);
            if(item.html().toLowerCase().match(query)) {
                item.parents('.col-md-3').show();
            } else {
                item.parents('.col-md-3').hide();
            }
        });
    });
});

var seekMedia = function(percent) {
    var position = percent * currentMediaSession.media.duration / 100;
    console.log("Seeking to position " + position);
    var request = new chrome.cast.media.SeekRequest();
    request.currentTime = position;
    currentMediaSession.seek(request,
        onSeekSuccess.bind(this, position),
        onError);
};

var onSeekSuccess = function(position) {
    console.log("onSeekSuccess", position);
    mediaCurrentTime = position;
};

var loadMedia = function(title, url, thumb) {
    console.log('LoadMedia called: ', title, url, thumb);
    if (!session) {
        launchApp(function() {
            loadMedia(title, url, thumb);
        });
        return;
    }
    $('.current-media').html(title);
    $('.thumbnail').attr('src', thumb);
    $('#control-nav').show();
    $('.progress-striped').addClass('active').children('#progress').width('100%');
    console.log("loading... " + url);

    var mediaInfo = new chrome.cast.media.MediaInfo(url);
    mediaInfo.contentType = 'video/mp4';
    mediaInfo.customData = {
        "title:" : title,
        "thumbnail" : thumb
    };
    var request = new chrome.cast.media.LoadRequest(mediaInfo);
    request.autoplay = true;
    request.currentTime = 0;

    session.loadMedia(request,
        onMediaDiscovered.bind(this, 'loadMedia'),
        onMediaError);

};

/**
 * callback on success for loading media
 * @param {Object} e A non-null media object
 */
function onMediaDiscovered(how, mediaSession) {
    //console.log(how);
    //console.log(mediaSession);
    $('.progress-striped').removeClass('active');
    if(mediaSession && mediaSession.media) {
        if(typeof(mediaSession.media[0]) != "undefined") {
            currentMediaSession = mediaSession.media[0];
        } else {
            currentMediaSession = mediaSession;
        }

        $('#control-nav').show();
        updateControls(currentMediaSession.playerState);

        mediaSession.addUpdateListener(onMediaStatusUpdate);
        mediaCurrentTime = currentMediaSession.currentTime;

        data = currentMediaSession.media.customData;
        if(data.thumbnail) {
            $('.thumbnail').attr('src',data.thumbnail);
        }
        if(data.title) {
            $('.current-media').html(data.title);
        }

        setCurrentTime(mediaCurrentTime,currentMediaSession.media.duration);
        controls.removeClass('disabled');
    }
}

function setCurrentTime(current, duration){
    var percent = current / duration * 100;
    $("#progress").attr('style','width: ' + percent + '%');
    $(".currentTime").html(formatTime(current) + "/" + formatTime(duration));
}

function formatTime(duration) {
    duration = Math.floor(duration);

    var hours = Math.floor(duration / 3600),
        minutes = Math.floor((duration - (hours*3600)) / 60),
        seconds = duration % 60;

    if(hours < 1) hours = "00";
    if(minutes < 1) minutes = "00";
    if(seconds < 1) seconds = "00";

    return hours + ":" + minutes + ":" + seconds;
}


/**
 * callback on media loading error
 * @param {Object} e A non-null media object
 */
function onMediaError(e) {
    console.log("media error: ", e);
    controls.addClass('disabled');
}

/**
 * callback for media status event
 * @param {Object} e A non-null media object
 */
var onMediaStatusUpdate = function(isAlive) {
    if(isAlive) {
        mediaCurrentTime = currentMediaSession.currentTime;
        clearTimeout(progressTimeout);
        setCurrentTime(mediaCurrentTime, currentMediaSession.media.duration);
        updateControls(currentMediaSession.playerState);
        console.log("Forcibly updated mediaCurrentTime to: " + mediaCurrentTime);
    }
};

/**
 * Call initialization
 */
if (!chrome.cast || !chrome.cast.isAvailable) {
    setTimeout(initializeCastApi, 1000);
}

/**
 * initialization
 */
function initializeCastApi() {
    var applicationID = chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID;
    var sessionRequest = new chrome.cast.SessionRequest(applicationID);
    var apiConfig = new chrome.cast.ApiConfig(sessionRequest,
        sessionListener,
        receiverListener);
    chrome.cast.initialize(apiConfig, onInitSuccess, onError);
}

function sessionListener(e) {
    console.log('New session ID: ' + e.sessionId);
    session = e;
    if (session.media.length != 0) {
        console.log(
            'Found ' + session.media.length + ' existing media sessions.');
        onMediaDiscovered('onRequestSessionSuccess_', session);
    }
    session.addMediaListener(
        onMediaDiscovered.bind(this, 'addMediaListener'));
    session.addUpdateListener(sessionUpdateListener.bind(this));
}

/**
 * session update listener
 */
function sessionUpdateListener(isAlive) {
    var message = isAlive ? 'Session Updated' : 'Session Removed';
    message += ': ' + session.sessionId;
    console.log(message);
    if (!isAlive) {
        session = null;
    }
}

function launchApp(cb) {
    console.log("launching app...");
    chrome.cast.requestSession(onRequestSessionSuccess.bind(this, cb), onLaunchError);
}

function onRequestSessionSuccess(cb, sess) {
    session = sess;
    cb();
}

/**
 * callback on launch error
 */
function onLaunchError(e) {
    console.log("launch error: ", e);
}

function receiverListener(e) {
    if( e === 'available' ) {
        console.log("receiver found");
    }
    else {
        console.log(e);
        console.log("receiver list empty");
        setTimeout(initializeCastApi, 1000);
    }
}

function onInitSuccess() {
    console.log('init success');
}

function onError(e) {
    console.log('Error: ', e);
}

function updateControls(state) {
    console.log("State: " + state);
    if(state == "BUFFERING") {
        $('.progress-striped').addClass('active');
    } else {
        $('.progress-striped').removeClass('active');
        if(state == "PLAYING") {
            stop.removeClass('disabled');
            play.removeClass('disabled');
            play.removeClass('glyphicon-play').addClass('glyphicon-pause');
            progressTimeout = setTimeout(updateProgress, 1000);
        } else if(state == "PAUSED") {
            stop.removeClass('disabled');
            play.removeClass('disabled');
            play.removeClass('glyphicon-pause').addClass('glyphicon-play');
        } else {
            play.addClass('disabled');
            stop.addClass('disabled');
        }
    }
}

/**
 * play media
 */
function playMedia() {
    if( !currentMediaSession ) {
        console.log("No media to play");
        return;
    }

    if( currentMediaSession.playerState != "PLAYING") {
        currentMediaSession.play(null,
            mediaCommandSuccessCallback.bind(this,"playing started for " + currentMediaSession.sessionId),
            onError);

        currentMediaSession.addUpdateListener(onMediaStatusUpdate);
        console.log('play started');
        progressTimeout = setTimeout(updateProgress, 1000);
    }
    else {
        clearTimeout(progressTimeout);
        currentMediaSession.pause(null,
            mediaCommandSuccessCallback.bind(this,"paused " + currentMediaSession.sessionId),
            onError);
    }
}

function updateProgress() {
    if(currentMediaSession) {
        mediaCurrentTime++;
        setCurrentTime(mediaCurrentTime, currentMediaSession.media.duration);
        var progress = parseInt(100 * mediaCurrentTime / currentMediaSession.media.duration);
        if( progressFlag ) {
            $('#progress').attr('aria-valuenow', progress);
            $('#progress').attr('style', "width: " + progress + "%;");
        }
        progressTimeout = setTimeout(updateProgress, 1000);
    } else {
        clearMedia();
    }
}

/**
 * stop media
 */
function stopMedia() {
    if( !currentMediaSession ) {
        console.log("No media session to stop");
        return;
    }

    currentMediaSession.stop(null,
        mediaCommandSuccessCallback.bind(this,"stopped"),
        onError);
}

function clearMedia() {
    console.log("Setting currentMediaSession to null");
    mediaCurrentTime = 0;
    clearTimeout(progressTimeout);
    setCurrentTime(0,0);
    $('.current-media').html('No video loaded');
    $('.thumbnail').hide();
    currentMediaSession = false;
    $('#control-nav').hide();
}

/**
 * callback on success for media commands
 * @param {string} info A message string
 * @param {Object} e A non-null media object
 */
function mediaCommandSuccessCallback(info, e) {
    if(info == "stopped") {
        clearMedia();
    }
}