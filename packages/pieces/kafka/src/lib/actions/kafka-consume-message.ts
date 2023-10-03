import {createAction, PieceAuth, Property} from "@activepieces/pieces-framework";
import { Kafka, } from 'kafkajs';
import { SchemaRegistry } from '@kafkajs/confluent-schema-registry';

export const kafkaConsumeMessage = createAction({
    name: 'kafka_consumer',
    auth: PieceAuth.None(),
    displayName: 'Kafka Consumer',
    description: 'Consume messages from Kafka',
    props: {
        bootstrap_server: Property.LongText({
            displayName: 'Bootstrap Server',
            description: 'The Kafka bootstrap server',
            required: true,
        }),
        topic: Property.LongText({
            displayName: 'Kafka Topic',
            description: 'The Kafka topic to consume the message from',
            required: true,
        }),
        consumer_group_id: Property.LongText({
            displayName: 'Consumer Group Id',
            description: 'The consumer group id',
            required: true,
        }),
        throughput: Property.Number({
            displayName: 'Throughput',
            description: 'The number of messages to consume per trigger',
            required: true,
        }),
        schema_registry_url: Property.LongText({
            displayName: 'Schema Registry',
            description: 'The Schema Registry URL',
            required: true,
        }),
    },

    async run(context) {
        console.log("Connecting to schema registry");
        const {
            bootstrap_server,
            topic ,
            consumer_group_id,
            throughput,
            schema_registry_url
        } = context.propsValue;

        const schemaRegistry = new SchemaRegistry({ host: schema_registry_url });



        const clientId = "my-client";
        console.log("Connecting to kafka with client id: " + clientId);
        console.log("Connecting to kafka with bootstrap server: " + bootstrap_server);
        const kafka = new Kafka({
            clientId: clientId,
            brokers: [bootstrap_server]
        });

        console.log("Connecting to kafka with consumer group id: " + consumer_group_id);
        const consumer = kafka.consumer({ groupId: consumer_group_id });
        const messages: any[] = [];

        try {
            await consumer.connect();
            await consumer.subscribe({
                topic: topic,
                fromBeginning: true
            });


            let count = 0;

            await consumer.run({
                eachMessage: async ({ topic, partition, message }) => {
                    // temp hack to limit the number of messages consumed
                    if (count >= throughput) {
                        return;
                    }

                    console.log("Message headers")
                    console.log(message.headers);
                    if (message.value !== null) {
                        const decodedValue = await schemaRegistry.decode(message.value);
                        console.log('Decoded value: ' + decodedValue);
                        messages.push(decodedValue);
                    }
                    count++;


                }
            });

            await new Promise(resolve => setTimeout(resolve, 5000));
        } catch (error) {
            console.error("Error consuming messages:", error);
        } finally {
            await consumer.stop();
            await consumer.disconnect();
        }

        return { messages: messages };
    },
});
