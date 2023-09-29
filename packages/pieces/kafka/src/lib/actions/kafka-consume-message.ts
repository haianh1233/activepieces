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
        })
    },

    async run(context) {
        console.log("Connecting to schema registry");

        const schemaRegistry = new SchemaRegistry({ host: 'http://127.0.0.1:8081/' });

        const { bootstrap_server, topic } = context.propsValue;

        const clientId = "my-client";
        console.log("Connecting to kafka with client id: " + clientId);
        console.log("Connecting to kafka with bootstrap server: " + bootstrap_server);
        const kafka = new Kafka({
            clientId: clientId,
            brokers: [bootstrap_server]
        });

        const consumerGroupId = "my-consumer-4402";
        console.log("Connecting to kafka with consumer group id: " + consumerGroupId);
        const consumer = kafka.consumer({ groupId: consumerGroupId });
        const messages: any[] = [];

        try {
            await consumer.connect();
            await consumer.subscribe({
                topic: topic,
                fromBeginning: true
            });


            let count = 0;
            const MAX_MESSAGES = 20;

            await consumer.run({
                eachMessage: async ({ topic, partition, message }) => {
                    if (count >= MAX_MESSAGES) {
                        return;
                    }

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
