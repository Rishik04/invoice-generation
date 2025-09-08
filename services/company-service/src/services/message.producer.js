// kafka/producer.js
import { Kafka } from "kafkajs";

const kafka = new Kafka({
  clientId: "company-service",
  brokers: ["localhost:9092"], // update with your Kafka broker
});

const producer = kafka.producer();

export async function connectProducer() {
  await producer.connect();
  console.log("✅ Kafka Producer connected (CompanyService)");
}

export async function sendCompanyEvent(eventType, data) {
  await producer.send({
    topic: "company-events",
    messages: [
      {
        key: eventType,
        value: JSON.stringify({ event: eventType, data }),
      },
    ],
  });
}

export async function sendProductEvent(eventType, data) {
  await producer.send({
    topic: "product-events",
    messages: [
      {
        key: eventType,
        value: JSON.stringify({ event: eventType, data }),
      },
    ],
  });

  console.log(`📤 Sent company event: ${eventType}`, data);
}
