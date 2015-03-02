#!/bin/sh

sudo apt-get install -y software-properties-common
sudo add-apt-repository -y ppa:jon-severinsson/ffmpeg
sudo apt-get update
sudo apt-get install -y nodejs npm mongodb git transmission-daemon supervisor nginx
sudo apt-get install -y ffmpeg
#sudo mkdir -p /data/db

sudo useradd -r cast

if [! -a /usr/bin/node]; then
    sudo ln -s /usr/bin/nodejs /usr/bin/node
fi
sudo cp /app/conf/supervisord.conf /etc/supervisor/conf.d/supervisord.conf
sudo npm install -g bower grunt-cli --quiet
cd /app
npm install --quiet
bower install --silent --allow-root

sudo mkdir -p /app/client/thumbnails
sudo chown cast:cast /app/torrents /app/watch /app/client/thumbnails

sudo update-rc.d nginx disable S123456
sudo update-rc.d mongodb disable S123456
sudo update-rc.d transmission-daemon disable S123456
sudo update-rc.d supervisor enable


## No longer needed, using ppa repository of real ffmpeg

#cd setup
#sudo ./compile_ffmpeg.sh