import express from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import cors from "cors";
import * as bycrypt from "bcryptjs";
import * as db from "./db/db.js";
import UserModel from "./model/user.js";
import { createTenant, getTenantId } from "./services/tenant-service.js";
import { emitUserCreated } from "./services/message-producer.js";

const app = express();

dotenv.config();

app.use(express.json());
app.use(cors());

// consumeTenantCreated().catch(console.error);

app.post("/login", async (req, res) => {
  try {
    await db.connect();
    const { email, password } = req.body;
    const user = await UserModel.findOne({ email });

    if (!user) {
      return res.status(401).send({ error: "Invalid credentials" });
    }
    const decryptedPassword = bycrypt.compare(password, user.password);
    if (!decryptedPassword) {
      return res.status(401).send({ error: "Invalid credentials" });
    }

    const SECRET_KEY = process.env.JWT_SECRET;

    const token = jwt.sign(
      { userId: user.id, role: user.role, email: user.email, tenantId: user.tenantId },
      SECRET_KEY,
      { expiresIn: "6h" }
    );
    res.send({ success: true, token: token });
  } catch (err) {
    console.log(err);
  } finally {
    await db.disconnect();
  }
});

app.post("/onboard", async (req, res) => {
  try {
    await db.connect();
    const { name, email, password, companyName } = req.body;
    const hashedPassword = await bycrypt.hash(password, 10);
    const tenant = await createTenant(companyName);

    const user = await new UserModel({
      name,
      email,
      password: hashedPassword,
      role: "OWNER",
      tenantId: tenant.response._id,
    }).save();

    await emitUserCreated(user);

    res.send({ message: "User registered successfully" });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).send({ error: "Email already exists" });
    }
  } finally {
    await db.disconnect();
  }
});

app.post("/:id/register", async (req, res) => {
  try {
    await db.connect();
    const { name, email, password } = req.body;
    const hashedPassword = await bycrypt.hash(password, 10);
    const { tenantId } = await getTenantId(req.params.id);
    const user = await new UserModel({
      name,
      email,
      password: hashedPassword,
      role: "USER",
      tenantId,
    }).save();
    res.send({ message: "User registered successfully" });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).send({ error: "Email already exists" });
    }
  } finally {
    await db.disconnect();
  }
});

app.listen(3003, () => {
  console.log("Auth Service running on port 3003");
});
