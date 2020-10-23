#!/bin/bash
echo "Launching bot";
nohup node bot.js config </dev/null >bot.log 2>&1 &
