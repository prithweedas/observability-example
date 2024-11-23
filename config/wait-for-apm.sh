until wget --quiet --no-check-certificate https://apm-server:8200 -O - | grep -q "\"publish_ready\": true"; do sleep 30; done;
sleep 30
exec "$@"