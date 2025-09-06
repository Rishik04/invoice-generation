import { Kafka } from "kafkajs";

const kafka = new Kafka({
  clientId: "auth-service",
  brokers: ["localhost:9092"],
});
// const consumer = kafka.consumer({ groupId: "auth-service-group" });

// export const consumeTenantCreated = async () => {
//   await consumer.connect();
//   await consumer.subscribe({ topic: "tenant-created", fromBeginning: true });

//   await consumer.run({
//     eachMessage: async ({ topic, partition, message }) => {
//       const tenant = JSON.parse(message.value.toString());
//       console.log("New tenant received:", tenant);
//     //   await 
//       // Prepare tenant-specific setup
//       // e.g., create default invoice settings or DB collection
//     },
//   });
// };