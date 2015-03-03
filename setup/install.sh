#!/bin/sh

sudo apt-get install -y software-properties-common
sudo add-apt-repository -y ppa:jon-severinsson/ffmpeg
sudo apt-get update
sudo apt-get install -y nodejs npm mongodb git transmission-daemon supervisor nginx ffmpeg

sudo useradd -r cast

if [ ! -e /usr/bin/node ]; then
    sudo ln -s /usr/bin/nodejs /usr/bin/node
fi

sudo mkdir -p /data/db
sudo rm -f /etc/supervisor/conf.d/cast.conf
sudo ln -s /app/conf/supervisord.conf /etc/supervisor/conf.d/cast.conf
sudo npm install -g bower grunt-cli --quiet
cd /app
npm install --quiet
bower install --silent --allow-root

mkdir -p /app/client/thumbnails

#don't start automatically, let supervisord manage them
sudo update-rc.d -f nginx disable
sudo update-rc.d -f mongodb disable
sudo update-rc.d -f transmission-daemon disable
sudo service nginx stop
sudo service mongodb stop
sudo service transmission-daemon stop

sudo update-rc.d -f supervisor enable
sudo service supervisor restart
## No longer needed, using ppa repository of real ffmpeg

#cd setup
#sudo ./compile_ffmpeg.sh