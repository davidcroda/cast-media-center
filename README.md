Setup used on my personal web server to download and stream torrents to my chromecast.

###Setup

 - Install Vagrant http://www.vagrantup.com
 - `$ vagrant up`
 - On the first run it will ask you to bridge an interface. This is so that you can cast to a chromecast
 on your local network.
 - It will also ask you for a sudo password to use NFS to mount the share (the alternative is extremely slow).
 - `vagrant ssh`
 - run `sudo supervisorctl fg cast` to bring the node app to the foreground and allow you to enter a username
 and password on the first run
 - The source code is mounted at /app
 - Services are managed with Supervisord http://supervisord.org/
 - Visit http://192.168.33.1 (or whatever ip you bridged to) to access the nginx reverse proxy pointed to the node application
 - If you want to run outside of vagrant, you just need to run `sudo ./setup/install.sh` however it requires Ubuntu 14.04 LTS

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