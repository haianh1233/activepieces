# Stage 1 -- install connectors
FROM confluentinc/cp-server-connect:latest AS install-connectors

ENV CONNECT_PLUGIN_PATH: "/usr/share/java,/usr/share/confluent-hub-components"

# Install SSE connector
RUN confluent-hub install --no-prompt cjmatta/kafka-connect-sse:1.0

# Install FromJson transformation
RUN confluent-hub install --no-prompt jcustenborder/kafka-connect-json-schema:0.2.5

# Stage 2 -- copy jars
FROM confluentinc/cp-server-connect:latest

COPY --from=install-connectors /usr/share/confluent-hub-components/ /usr/share/confluent-hub-components/