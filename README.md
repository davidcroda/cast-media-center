Setup used on my personal web server to download and stream torrents to my chromecast.

#### Dev Setup

 - Install Vagrant http://www.vagrantup.com
 - `$ vagrant up` - follow prompts as necessary
 - visit http://192.168.33.11/ in your browser. Default user: "dave", Default password: "changethis"
 - `$ ./scripts/manage.sh` will connect you to the supervisord instance

Torrents must use x264 video and 2-channel AAC audio to play on the chromecast.

Uses the transmission-daemon JSON-RPC API to manage torrents (very limited currently, only add, remove, and list)
Ffmpeg is used to generate thumbnails and eventually transcode to the correct video format

/client - Front end, AngularJS
/conf - service configuration files
/server - Back end, NodeJS / Express
/setup - installation scripts
/torrents - default torrent download directory

TODO:

 - [x] Switch rtorrent with transmission, manage torrents via json rpc api https://trac.transmissionbt.com/browser/trunk/extras/rpc-spec.txt
 - [ ] Restore transcoding features
 - [ ] Implement subtitles
 - [ ]Automatic extraction of archives
   - [x] Rar
   - [ ] Zip