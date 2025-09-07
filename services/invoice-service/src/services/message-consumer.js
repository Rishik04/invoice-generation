// kafka/companyConsumer.js (InvoiceService)
import { Kafka } from "kafkajs";
import CompanyCacheModel from "../model/company.cache.model.js";
// import CompanyCache from "../models/CompanyCache.js";

const kafka = new Kafka({
  clientId: "invoice-service",
  brokers: ["localhost:9092"],
});

const consumer = kafka.consumer({ groupId: "invoice-service-company" });

export async function startCompanyConsumer() {
  await consumer.connect();
  await consumer.subscribe({ topic: "company-events", fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ message }) => {
      const event = JSON.parse(message.value.toString());

      switch (event.event) {
        case "company.created":
        case "company.updated":
          await CompanyCacheModel.findByIdAndUpdate(
            event.data._id,
            { ...event.data, updatedAt: new Date() },
            { upsert: true, new: true }
          );
          console.log("✅ Cached company:", event);
          break;

        case "company.deleted":
          await CompanyCache.findByIdAndDelete(event.data._id);
          console.log("🗑️ Removed company:", event.data._id);
          break;
      }
    },
  });
}
