#!/bin/sh

RTORRENT=`tmux ls | grep rtorrent`
CAST=`tmux ls | grep cast`

if [ "$RTORRENT" = "" ]; then
    echo "Starting Rtorrent"
    tmux new-session -s rtorrent -d "rtorrent -o import=./.rtorrent.rc -n"
fi

if [ "$CAST" = "" ]; then
    echo "Starting Cast Media Center"
    tmux new-session -s cast -d "node server/app.js"
fi