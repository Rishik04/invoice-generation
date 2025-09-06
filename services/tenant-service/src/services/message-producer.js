import { Kafka } from "kafkajs";

const kafka = new Kafka({
  clientId: "tenant-service",
  brokers: ["localhost:9092"],
});

const Producer = kafka.producer();

export const emitTenantCreated = async (tenant) => {
  await Producer.connect();

  await Producer.send({
    topic: "tenant-created",
    messages: [
      {
        key: tenant._id.toString(),
        value: JSON.stringify({
          tenantId: tenant._id,
          tenantName: tenant.name,
          ownerId: tenant.ownerId,
          createdAt: tenant.createdAt,
        }),
      },
    ],
  });
  await Producer.disconnect();
};
