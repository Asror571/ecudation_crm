#!/bin/sh
set -eu

key_file=/data/db/replica-set-key

if [ ! -s "$key_file" ]; then
  umask 077
  head -c 756 /dev/urandom | base64 | tr -d '\n' > "$key_file"
  chmod 400 "$key_file"
fi

exec /usr/local/bin/docker-entrypoint.sh mongod \
  --replSet rs0 \
  --bind_ip_all \
  --keyFile "$key_file"
