#!/bin/bash

shopt -s extglob

apt-get install -y software-properties-common
add-apt-repository ppa:mc3man/trusty-media

apt-get update
apt-get install -y nodejs npm mongodb git transmission-daemon \
    supervisor nginx ffmpeg

useradd -r cast

if [ ! -e /usr/bin/node ]; then
    ln -s /usr/bin/nodejs /usr/bin/node
fi

mkdir -p /data/db
rm -f /etc/supervisor/conf.d/cast.conf
ln -s /app/conf/supervisord.conf /etc/supervisor/conf.d/cast.conf
npm install -g bower grunt-cli nodemon node-inspector --quiet

#Install node-rar fork
git clone https://www.github.com/davidcroda/node-rar /tmp/node-rar-tmp
cd /tmp/node-rar-tmp
sudo npm install -g --quiet
line='NODE_PATH="/usr/local/lib/node_modules"'
grep -q -F ${line} /etc/environment || echo ${line} >> /etc/environment
export ${line}
cd /app
rm -r /tmp/node-rar-tmp

cd /app
npm install --quiet
bower install --silent --allow-root

#don't start automatically, let supervisord manage them
echo manual > /etc/init/nginx.override
echo manual > /etc/init/mongodb.override
echo manual > /etc/init/transmission-daemon.override
update-rc.d -f nginx disable
update-rc.d -f mongodb disable
update-rc.d -f transmission-daemon disable

service nginx stop
service mongodb stop
service transmission-daemon stop

sudo chown -R cast:cast /app

update-rc.d -f supervisor enable
service supervisor restart
supervisorctl restart all

## No longer needed, using ppa repository of real ffmpeg
#cd setup
#./compile_ffmpeg.sh
