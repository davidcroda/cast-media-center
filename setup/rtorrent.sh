#!/bin/sh

BASE="/home/dave/src/rtorrent"

sudo apt-get -y install subversion libcurl4-openssl-dev libtorrent-dev libncurses-dev

mkdir -p "$BASE"

#xmlrpc-c
cd "$BASE"
svn co http://svn.code.sf.net/p/xmlrpc-c/code/advanced xmlrpc-c
cd xmlrpc-c
./configure
make
sudo make install

#libtorrent and rtorrent
cd "$BASE"
wget http://libtorrent.rakshasa.no/downloads/libtorrent-0.13.2.tar.gz
wget http://libtorrent.rakshasa.no/downloads/rtorrent-0.9.2.tar.gz
tar xzfv libtorrent-0.13.2.tar.gz
tar xzfv rtorrent-0.9.2.tar.gz
cd libtorrent-0.13.2
./configure
make
sudo make install
cd ../rtorrent-0.9.2/
./configure --with-xmlrpc-c=/usr/local/bin/xmlrpc-c-config
make
sudo make install

cd "$BASE"
wget http://dl.bintray.com/novik65/generic/rutorrent-3.6.tar.gz
tar xzvf rutorrent-3.6.tar.gz
cd rutorrent
