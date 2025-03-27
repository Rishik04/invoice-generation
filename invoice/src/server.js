const express = require("express");
const router = require("./routes");
const path = require("path");
const { log } = require("console");

const app = express();
app.use(express.json());

app.use("/public", express.static(path.join(__dirname, "public")));

app.use("/invoice", router);

app.listen(3004, () => {
  console.log("PDF Service running on port 3004");
});
