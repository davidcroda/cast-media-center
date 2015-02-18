#!/bin/sh

sudo apt-get install -y software-properties-common
sudo add-apt-repository -y ppa:jon-severinsson/ffmpeg
sudo apt-get update
sudo apt-get install -y nodejs npm mongodb git rtorrent supervisor nginx
sudo apt-get install -y ffmpeg
#sudo mkdir -p /data/db

sudo useradd -r cast

sudo ln -s /usr/bin/nodejs /usr/bin/node
sudo cp /app/conf/supervisord.conf /etc/supervisor/conf.d/supervisord.conf
sudo npm install -g bower grunt-cli --quiet
cd /app
npm install --quiet
bower install --silent --allow-root

sudo mkdir -p /app/client/thumbnails
sudo chown cast:cast /app/torrents /app/watch /app/client/thumbnails

sudo update-rc.d nginx disable
sudo update-rc.d mongodb disable
sudo update-rc.d supervisor enable
#cd setup
#sudo ./compile_ffmpeg.sh