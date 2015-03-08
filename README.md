Setup used on my personal web server to download and stream torrents to my chromecast.

###Setup

 - Install Vagrant http://www.vagrantup.com
 - `$ vagrant up`
 - `$ vagrant ssh -c sudo supervisorctl fg cast`
 - enter a username and password (you are only prompted if a user has not been created)
 - visit http://192.168.33.11/ in your browser.
 - The source code is mounted at /app
 - Services are managed with Supervisord http://supervisord.org/
 - If you want to run outside of vagrant, you just need to run `sudo ./setup/install.sh` however it has only been tested Ubuntu 14.04 LTS

Torrents must use x264 video and 2-channel AAC audio to play on the chromecast.  Transcoding was causing problems 
and is disabled at the moment.

Uses the transmission-daemon JSON-RPC API to manage torrents (very limited currently, only add, remove, and list)
Ffmpeg is used to generate thumbnails and eventually transcode to the correct video format

/client - Front end, AngularJS
/conf - service configuration files
/server - Back end, NodeJS / Express
/setup - installation scripts
/torrents - default torrent download directory

TODO:

 - ~~Switch rtorrent with transmission, manage torrents via json rpc api https://trac.transmissionbt.com/browser/trunk/extras/rpc-spec.txt~~
 - Restore transcoding features
 - Implement subtitles
 - Automatic extraction of archives
   - ~~Rar~~
   - Zip