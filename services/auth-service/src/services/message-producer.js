import { Kafka } from "kafkajs";

const kafka = new Kafka({
  clientId: "auth-service",
  brokers: ["localhost:9092"],
});

const Producer = kafka.producer();

export const emitUserCreated = async (user) => {
  await Producer.connect();

  await Producer.send({
    topic: "user-created",
    messages: [
      {
        key: user._id.toString(),
        value: JSON.stringify({
          userId: user._id,
          name: user.name,
          email: user.email,
          tenantId: user.tenantId,
          createdAt: user.createdAt,
        }),
      },
    ],
  });
//   await Producer.disconnect();
};
