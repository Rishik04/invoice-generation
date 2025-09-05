import express from "express";
import cors from "cors";
import router from "./routes/index.js";
import * as db from "./db/db.js";
import * as env from "dotenv";

env.config();
await db.connect();

const app = express();
app.use(express.json());
app.use(cors());

app.use("/", router);

app.listen(3001, () => {
  console.log("Company Service running on port 3001");
});
