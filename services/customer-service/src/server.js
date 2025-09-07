import express from "express";
import cors from "cors";
import router from "./routes/index.js";
import * as db from "./db/db.js";
import * as env from "dotenv";
import { consumeTenantCreated } from "./services/message-consumer.js";

const app = express();
env.config();
await db.connect();

consumeTenantCreated().catch(console.error);
app.use(express.json());
app.use(cors());

app.use("/", router);

app.listen(3005, () => {
  console.log("Company Service running on port 3001");
});
