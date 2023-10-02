import {createAction, PieceAuth, Property} from "@activepieces/pieces-framework";
import { Kafka } from 'kafkajs';

export const kafkaProduceMessage = createAction({
    name: 'kafka_producer',
    auth: PieceAuth.None(),
    displayName: 'Kafka Producer',
    description: 'Produce messages to Kafka',
    props: {
        bootstrap_server: Property.LongText({
            displayName: 'Bootstrap Server',
            description: 'The Kafka bootstrap server',
            required: true,
        }),
        topic: Property.LongText({
            displayName: 'Kafka Topic',
            description: 'The Kafka topic to produce the message to',
            required: true,
        }),
        message: Property.Object({
            displayName: 'Message',
            description: 'The message to produce to Kafka',
            required: true,
        }),
    },

    async run(context) {
        const { bootstrap_server, topic, message } = context.propsValue;

        const kafka = new Kafka({
            clientId: 'my-app',
            brokers: [bootstrap_server]
        });

        const producer = kafka.producer();
        await producer.connect();

        console.log('Send message : \n' + JSON.stringify(message) + '\n to topic: ' + topic)
        await producer.send({
            topic: topic,
            messages: [ {value: JSON.stringify(message)} ],
        });

        await producer.disconnect();

        return { status: 'Message sent to Kafka successfully' };
    },
});
