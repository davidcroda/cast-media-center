Setup I use on my private server to download torrents and stream them to my chromecast.

It's only setup for a single user, you will be prompted on initial run to enter a username and password.

Torrents added are placed in the watch directory for rTorrent.  It downloads to the "torrents" directory
which is periodically monitored for new files.  It's not an ideal system to say the least, but it does the job.

Torrents must use x264 video and 2-channel AAC audio to play on the chromecast.  Transcoding was causing problems 
and is disabled at the moment.

**Work in progress. Most likely will not work for you. Programmers only**

TODO:

 - Switch rtorrent with transmission, manage torrents via json rpc api https://trac.transmissionbt.com/browser/trunk/extras/rpc-spec.txt
 - Restore transcoding features
 - Implement subtitles