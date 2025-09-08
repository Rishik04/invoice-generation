import cors from "cors";
import express from "express";
import router from "./routes/index.js";
import { startCompanyConsumer, startProductConsumer } from "./services/message-consumer.js";
import * as db from "./db/db.js";
import * as env from "dotenv";

env.config();

const app = express();
await db.connect();
app.use(cors());
app.use(express.json());
startCompanyConsumer().catch(console.error);
startProductConsumer().catch(console.error);

// app.use("/public", express.static(path.join(__dirname, "public")));

app.use("/", router);

app.listen(3004, () => {
  console.log("PDF Service running on port 3004");
});
