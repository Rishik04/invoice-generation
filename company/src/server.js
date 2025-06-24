const bodyParser = require("body-parser");
const express = require("express");
const router = require("./routes");
const app = express();
const cors = require("cors");

app.use(express.json());
app.use(bodyParser.json());
app.use(cors());

app.use("/", router);

app.listen(3001, () => {
  console.log("Company Service running on port 3001");
});
