
import { createPiece, PieceAuth } from "@activepieces/pieces-framework";
import { kafkaProduceMessage } from "./lib/actions/kaka-produce-message";
import {kafkaConsumeMessage} from "./lib/actions/kafka-consume-message";

export const kafka = createPiece({
  displayName: "Kafka",
  auth: PieceAuth.None(),
  minimumSupportedRelease: '0.8.0',
  logoUrl: "https://logowik.com/content/uploads/images/kafka8040.jpg",
  authors: [],
  actions: [kafkaProduceMessage, kafkaConsumeMessage],
  triggers: [],
});
