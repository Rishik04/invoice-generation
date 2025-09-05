import express from "express";
import tenantRouter from "./routes/tenant.js";
import cors from "cors";
const PORT = 8080;
const app = express();
import dotenv from "dotenv";
import { consumeUserCreated } from "./services/message-consumer.js";
import { connect } from "./db/db.js";

dotenv.config();
await connect();

consumeUserCreated().catch(console.error);

app.use(express.json());
app.use(cors());
app.use("/", tenantRouter);

app.listen(PORT, () => {
  console.log(`tenant server is running on http://localhost:${PORT}`);
});
