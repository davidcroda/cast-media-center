class Excast

  constructor: (@applicationId)->
    if !chrome.cast || !chrome.cast.isAvailable
      setTimeout @initializeCastApi, 1000

  initializeCastApi: ()->
    sessionRequest = new chrome.cast.SessionRequest @applicationId
    apiConfig = new chrome.cast.ApiConfig sessionRequest, sessionListener, receiverListener
    chrome.cast.initialize(apiConfig, @onInitSuccess, @onError)

  onMediaDiscovered: (session)->
    if session && session.media
      if session.media.length > 0
        @currentSession = session.media[0]
      else
        @currentSession = session
    console.log(@currentSession)

  onInitSuccess: ()->
    console.log 'init success'

  onError: (e)->
    console.log 'Error: ', e

  sessionListener: (e)->
    console.log "Received new Session ID: " + e.sessionId
    console.log e
    @onMediaDiscovered e

  receiverListener: (e)->
    if e == 'available'
      console.log "receiver found"
    else
      console.log e


$ ()->
  excast = new Excast(chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID);
