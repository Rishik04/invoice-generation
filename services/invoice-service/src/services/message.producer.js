import { Kafka } from "kafkajs";

const kafka = new Kafka({
  clientId: "company-service",
  brokers: ["localhost:9092"],
});

const producer = kafka.producer();

export async function connectProducer() {
  await producer.connect();
  console.log("✅ Kafka Producer connected (InvoiceService)");
}

export async function sendCustomerEvent(eventType, data) {
  await producer.send({
    topic: "customer-commands",
    messages: [
      {
        key: eventType,
        value: JSON.stringify({ event: eventType, data }),
      },
    ],
  });

  //   console.log(`📤 Sent customer event: ${eventType}`, data);
}
