// kafka/companyConsumer.js (InvoiceService)
import { Kafka } from "kafkajs";
import CompanyCacheModel from "../model/company.cache.model.js";
import ProductCacheModel from "../model/product.cache.model.js";
import { addCustomerIdInInvoice } from "./invoice.service.js";

const kafka = new Kafka({
  clientId: "invoice-service",
  brokers: ["localhost:9092"],
});

const companyConsumer = kafka.consumer({ groupId: "invoice-service-company" });
const productConsumer = kafka.consumer({ groupId: "invoice-service-product" });
const customerConsumer = kafka.consumer({
  groupId: "invoice-service-customer",
});

export async function startCompanyConsumer() {
  await companyConsumer.connect();
  await companyConsumer.subscribe({
    topic: "company-events",
    fromBeginning: true,
  });

  await companyConsumer.run({
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

export async function startProductConsumer() {
  await productConsumer.connect();
  await productConsumer.subscribe({
    topic: "product-events",
    fromBeginning: true,
  });

  await productConsumer.run({
    eachMessage: async ({ message }) => {
      const event = JSON.parse(message.value.toString());

      switch (event.event) {
        case "product.created":
        case "product.updated":
          await ProductCacheModel.findByIdAndUpdate(
            event.data._id,
            { ...event.data, updatedAt: new Date() },
            { upsert: true, new: true }
          );
          console.log("✅ Cached product:", event.data._id);
          break;

        case "product.deleted":
          await ProductCacheModel.findByIdAndDelete(event.data._id);
          console.log("🗑️ Removed product:", event.data._id);
          break;
      }
    },
  });
}

export async function startCustomerConsumer() {
  await customerConsumer.connect();
  await customerConsumer.subscribe({
    topic: "customer-events",
    fromBeginning: true,
  });

  await customerConsumer.run({
    eachMessage: async ({ message }) => {
      const event = JSON.parse(message.value.toString());

      switch (event.event) {
        case "customer.created":
        case "customer.updated":
          // console.log("✅ Customer id received:", event);
          await addCustomerIdInInvoice(event.data);
          break;
      }
    },
  });
}
