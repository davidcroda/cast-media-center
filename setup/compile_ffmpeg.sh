#!/bin/sh

sudo apt-get update
sudo apt-get -y install autoconf automake build-essential libass-dev libgpac-dev \
  libsdl1.2-dev libtheora-dev libtool libva-dev libvdpau-dev libvorbis-dev libx11-dev \
  libxext-dev libxfixes-dev pkg-config texi2html zlib1g-dev unzip libmp3lame-dev libass-dev

BASE="/home/$USER/src"
BINDIR="/usr/local/bin"

mkdir -p "$BASE/ffmpeg_sources"
mkdir -p "$BINDIR"

cd "$BASE/ffmpeg_sources"
wget http://www.tortall.net/projects/yasm/releases/yasm-1.2.0.tar.gz
tar xzvf yasm-1.2.0.tar.gz
cd yasm-1.2.0
./configure --prefix="$BASE/ffmpeg_build" --bindir="$BINDIR"
make
sudo make install
make distclean
export "PATH=$PATH:$BINDIR"


cd "$BASE/ffmpeg_sources"
wget http://download.videolan.org/pub/x264/snapshots/last_x264.tar.bz2
tar xjvf last_x264.tar.bz2
cd x264-snapshot*
./configure --prefix="$BASE/ffmpeg_build" --bindir="$BINDIR" --enable-static
make
sudo make install
make distclean


cd "$BASE/ffmpeg_sources"
wget -O fdk-aac.zip https://github.com/mstorsjo/fdk-aac/zipball/master
unzip fdk-aac.zip
cd mstorsjo-fdk-aac*
autoreconf -fiv
./configure --prefix="$BASE/ffmpeg_build" --disable-shared
make
sudo make install
make distclean

cd "$BASE/ffmpeg_sources"
wget http://downloads.xiph.org/releases/opus/opus-1.1.tar.gz
tar xzvf opus-1.1.tar.gz
cd opus-1.1
./configure --prefix="$BASE/ffmpeg_build" --disable-shared
make
sudo make install
make distclean

cd "$BASE/ffmpeg_sources"
wget http://webm.googlecode.com/files/libvpx-v1.3.0.tar.bz2
tar xjvf libvpx-v1.3.0.tar.bz2
cd libvpx-v1.3.0
./configure --prefix="$BASE/ffmpeg_build" --disable-examples
make
sudo make install
make clean

cd "$BASE/ffmpeg_sources"
wget http://ffmpeg.org/releases/ffmpeg-snapshot.tar.bz2
tar xjvf ffmpeg-snapshot.tar.bz2
cd ffmpeg
PKG_CONFIG_PATH="$BASE/ffmpeg_build/lib/pkgconfig"
export PKG_CONFIG_PATH
./configure --prefix="$BASE/ffmpeg_build" --extra-cflags="-I$BASE/ffmpeg_build/include" \
   --extra-ldflags="-L$BASE/ffmpeg_build/lib" --bindir="$BINDIR" --extra-libs=-ldl --enable-gpl \
   --enable-libass --enable-libfdk-aac --enable-libmp3lame --enable-libopus --enable-libtheora \
   --enable-libvorbis --enable-libvpx --enable-libx264 --enable-nonfree
make
sudo make install
make distclean
hash -r
