#!/bin/bash

HEADER="Content-Type: application/json"
DATA=$( cat << EOF
{
  "name": "wikipedia-sse",
  "config": {
    "connector.class": "com.github.cjmatta.kafka.connect.sse.ServerSentEventsSourceConnector",
    "sse.uri": "https://stream.wikimedia.org/v2/stream/recentchange",
    "topic": "wikipedia",
    "transforms": "extractData, parseJSON",
    "transforms.extractData.type": "org.apache.kafka.connect.transforms.ExtractField\$Value",
    "transforms.extractData.field": "data",
    "transforms.parseJSON.type": "com.github.jcustenborder.kafka.connect.json.FromJson\$Value",
    "transforms.parseJSON.json.exclude.locations": "#/properties/log_params,#/properties/\$schema,#/\$schema",
    "transforms.parseJSON.json.schema.location": "Url",
    "transforms.parseJSON.json.schema.url": "https://raw.githubusercontent.com/wikimedia/mediawiki-event-schemas/master/jsonschema/mediawiki/recentchange/1.0.0.json",
    "transforms.parseJSON.json.schema.validation.enabled": "false",
    "producer.interceptor.classes": "io.confluent.monitoring.clients.interceptor.MonitoringProducerInterceptor",
    "value.converter": "io.confluent.connect.avro.AvroConverter",
    "value.converter.schema.registry.url": "http://schema-registry:8081",
    "tasks.max": "1"
  }
}
EOF
)

docker compose exec connect curl -X POST -H "${HEADER}" --data "${DATA}" connectorSubmitter:connectorSubmitter http://connect:8083/connectors || exit 1
