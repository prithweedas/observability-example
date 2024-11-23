if [ ! -f config/certs/instances.yml ]; then
  cp instances.yml config/certs/instances.yml
fi;

if [ ! -f config/certs/ca.zip ]; then
  bin/elasticsearch-certutil ca --silent --pem --out config/certs/ca.zip;
  unzip config/certs/ca.zip -d config/certs;
fi;

if [ ! -f config/certs/certs.zip ]; then
  bin/elasticsearch-certutil cert --silent --pem \
    --out config/certs/certs.zip \
    --in config/certs/instances.yml \
    --ca-cert config/certs/ca/ca.crt \
    --ca-key config/certs/ca/ca.key;
  unzip config/certs/certs.zip -d config/certs;
fi;

rm config/certs/certs.zip
rm config/certs/ca.zip
rm config/certs/instances.yml

chown -R root:root config/certs;
find ./config/certs -type d -exec chmod 750 \{\} \;;
find ./config/certs -type f -exec chmod 640 \{\} \;;

until curl -s --cacert config/certs/ca/ca.crt https://elasticsearch:9200 | grep -q "missing authentication credentials"; do sleep 30; done;

until curl -s -X POST --cacert config/certs/ca/ca.crt -u "elastic:${ELASTIC_PASSWORD}" -H "Content-Type: application/json" https://elasticsearch:9200/_security/user/kibana_system/_password -d "{\"password\":\"${KIBANA_PASSWORD}\"}" | grep -q "^{}"; do sleep 10; done;

until curl -s -X POST --cacert config/certs/ca/ca.crt -u "elastic:${ELASTIC_PASSWORD}" -H "Content-Type: application/json" https://elasticsearch:9200/_security/user/apm_system/_password -d "{\"password\":\"${APM_PASSWORD}\"}" | grep -q "^{}"; do sleep 10; done;
