import { Kafka } from "kafkajs";
import { createCompany } from "./company.service.js";

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
      const tenant = JSON.parse(message.value.toString());
      console.log("New onwer received:", tenant);
      //initialize a company with the tenant
      await createCompany({
        name: tenant.tenantName,
        tenantId: tenant.tenantId,
      });
    },
  });
};
