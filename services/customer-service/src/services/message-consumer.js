import { Kafka } from "kafkajs";
import { createCustomerInDB } from "./customer.service.js";

const kafka = new Kafka({
  clientId: "customer-service",
  brokers: ["localhost:9092"],
});
const consumer = kafka.consumer({ groupId: "customer-service-group" });

export async function startCustomerConsumer() {
  await consumer.connect();
  await consumer.subscribe({ topic: "customer-commands", fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ message }) => {
      const event = JSON.parse(message.value.toString());
      await createCustomerInDB(event.data);
      console.log("✅ Cached customer:", event);
    },
  });
}
