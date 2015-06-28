#!/bin/sh

sudo apt-get install -y software-properties-common
sudo add-apt-repository ppa:mc3man/trusty-media
  
# Enable multiverse repo for unrar
#sudo add-apt-repository "deb http://archive.ubuntu.com/ubuntu trusty multiverse"
#sudo add-apt-repository "deb http://archive.ubuntu.com/ubuntu trusty-updates multiverse"

sudo apt-get update
sudo apt-get install -y nodejs npm mongodb git transmission-daemon \
    supervisor nginx ffmpeg # unrar

sudo useradd -r cast

if [ ! -e /usr/bin/node ]; then
    sudo ln -s /usr/bin/nodejs /usr/bin/node
fi

sudo mkdir -p /data/db
sudo rm -f /etc/supervisor/conf.d/cast.conf
sudo ln -s /app/conf/supervisord.conf /etc/supervisor/conf.d/cast.conf
sudo npm install -g bower grunt-cli nodemon node-inspector --quiet
cd /app
npm install --quiet
bower install --silent --allow-root

mkdir -p /app/client/thumbnails

#don't start automatically, let supervisord manage them
echo manual | sudo tee /etc/init/nginx.override
echo manual | sudo tee /etc/init/mongodb.override
echo manual | sudo tee /etc/init/transmission-daemon.override

sudo service nginx stop
sudo service mongodb stop
sudo service transmission-daemon stop

sudo update-rc.d -f supervisor enable
sudo service supervisor restart
## No longer needed, using ppa repository of real ffmpeg

#cd setup
#sudo ./compile_ffmpeg.sh
