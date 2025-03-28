const bodyParser = require("body-parser");
const express = require("express");
const router = require("./routes");
const app = express();

app.use(express.json());
app.use(bodyParser.json());

app.use("/", router);

app.listen(3001, () => {
  console.log("Company Service running on port 3001");
});
