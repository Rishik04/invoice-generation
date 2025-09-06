import { Kafka } from "kafkajs";
import TenantModel from "../models/tenantModel.js";
import { connect, disconnect } from "../db/db.js";
import { emitTenantCreated } from "./message-producer.js";

const kafka = new Kafka({
  clientId: "tenant-service",
  brokers: ["localhost:9092"],
});
const consumer = kafka.consumer({ groupId: "tenant-service-group" });

export const consumeUserCreated = async () => {
  await consumer.connect();
  await consumer.subscribe({ topic: "user-created", fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const user = JSON.parse(message.value.toString());
      console.log("New onwer received:", user);
      const tenant = await TenantModel.findById(user.tenantId);
      tenant.ownerId = user.userId;
      tenant.save();
      await emitTenantCreated(tenant);
    },
  });
};
