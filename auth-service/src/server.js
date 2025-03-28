const express = require("express");
const jwt = require("jsonwebtoken");
const app = express();
const dotenv = require("dotenv");
const { UserModel } = require("./model/user");
const bycrypt = require("bcryptjs");
const db = require("./db/db");
dotenv.config();

app.use(express.json());

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
      { userId: user.id, role: user.role, email: user.email },
      SECRET_KEY,
      { expiresIn: "1h" }
    );
    res.send({ token });
  } catch (err) {
    console.log(err);
  } finally {
    await db.disconnect();
  }
});

app.post("/register", async (req, res) => {
  try {
    await db.connect();
    const { email, password } = req.body;
    const hashedPassword = await bycrypt.hash(password, 10);
    const user = new UserModel({
      email,
      password: hashedPassword,
    });
    await user.save();
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
