import { Kafka } from "kafkajs";

const kafka = new Kafka({
  clientId: "company-service",
  brokers: ["localhost:9092"],
});
const consumer = kafka.consumer({ groupId: "company-service-group" });

export const consumeTenantCreated = async () => {
  await consumer.connect();
  await consumer.subscribe({ topic: "tenant-created", fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const user = JSON.parse(message.value.toString());
      console.log("New onwer received:", user);
      //logic here
    },
  });
};
