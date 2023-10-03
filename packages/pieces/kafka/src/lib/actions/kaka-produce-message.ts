import {createAction, PieceAuth, Property} from "@activepieces/pieces-framework";
import {Kafka} from 'kafkajs';
import {SchemaRegistry, SchemaType} from '@kafkajs/confluent-schema-registry';
import https from 'https';

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
        schema_registry_url: Property.LongText({
            displayName: 'Schema Registry',
            description: 'The Schema Registry URL',
            required: true,
        }),
        schema_id: Property.Number({
            displayName: 'Schema Id',
            description: 'The Schema Id',
            required: true,
        }),
    },

    async run(context) {

        const {
            bootstrap_server,
            topic,
            message,
            schema_registry_url,
            schema_id
        } = context.propsValue;


        const schemaRegistry = new SchemaRegistry({host: schema_registry_url});

        const schema = await schemaRegistry.getSchema(schema_id);
        console.log('Registering schema: ' + schema);

        const options = {
            subject: topic + '-value',
        };

        await schemaRegistry.register({
                type: SchemaType.AVRO,
                schema: JSON.stringify(schema)
            },
            options
        );

        const kafka = new Kafka({
            clientId: 'my-app',
            brokers: [bootstrap_server]
        });

        const producer = kafka.producer();
        await producer.connect();

        console.log('Send message : \n' + JSON.stringify(message) + '\n to topic: ' + topic)

        const encodedMessage = await schemaRegistry.encode(schema_id, message);

        await producer.send({
            topic: topic,
            messages: [{value: encodedMessage}],
        });

        await producer.disconnect();

        return {status: 'Message sent to Kafka successfully'};
    },
});
