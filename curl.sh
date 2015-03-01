#!/bin/sh

SESSION_ID="2CxOC0GHYsg4jbvhmoX2fwtG4zWeoB0TBcTuJbO3eOnf9fga"
curl -X POST -H "X-Transmission-Session-Id: $SESSION_ID" -H "Content-Type: application/json" -v  http://localhost:9091/transmission/rpc -d'
{
  "method": "torrent-get",
  "arguments": {
    "fields": ["name"]
  }
}'