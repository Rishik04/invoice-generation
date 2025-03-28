const express = require("express");
const router = require("./routes");
const path = require("path");
const { log } = require("console");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use("/public", express.static(path.join(__dirname, "public")));

app.use("/", router);

app.listen(3004, () => {
  console.log("PDF Service running on port 3004");
});
