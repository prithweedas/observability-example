APM_SERVER_HOST="$1"
shift
CMD_TO_EXECUTE="$@"

until wget --quiet --no-check-certificate "https://$APM_SERVER_HOST:8200" -O - | grep -q "\"publish_ready\": true"; do 
  sleep 30
done;

sleep 30

$CMD_TO_EXECUTE
