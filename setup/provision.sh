#!/bin/sh

sudo apt-get install -y software-properties-common
sudo add-apt-repository -y ppa:jon-severinsson/ffmpeg
sudo apt-get update
sudo apt-get install -y nodejs npm mongodb git rtorrent supervisor nginx
sudo apt-get install -y ffmpeg
mkdir -p /data/db
sudo ln -s /usr/bin/nodejs /usr/bin/node
sudo npm install -g bower grunt-cli --quiet
cd /app
npm install --quiet
bower install --silent --allow-root
#cd setup
#sudo ./compile_ffmpeg.sh