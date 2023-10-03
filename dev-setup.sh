#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null && pwd )"

echo "Build"
docker compose -f ./docker-compose.dev.yml build

echo "Starting Docker Compose"
docker compose -f ./docker-compose.dev.yml up -d --wait

# Find a better way to do this later
echo "Granting permissions to cache folder"
sudo chmod -R 777 ./cache

sleep 2

echo "Creating Wikipedia Topics"
docker exec -it zookeeper-cluster-a kafka-topics --create --topic wikipedia --partitions 1 --replication-factor 1 --bootstrap-server kafka-cluster-a:9092

echo "Creating Kafka Connectors for Wikipedia"
"${DIR}"/connector/submit_wikipedia_sse_config.sh || exit 1
