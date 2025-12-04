/** @format */

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const router = require("./routes");
const { handleError, notFound } = require("./middleware/handleError");
const mqttClient = require("./helper/mqttHandler");

const app = express();

const port = process.env.PORT;

app.use(cors());
app.use(express.urlencoded({ extended: true, limit: "3mb" }));
app.use(express.json({ limit: "5mb" }));
app.use(express.static("public"));

app.use("/", router);
app.use(notFound);
app.use(handleError);

// const mqttClient = new mqttHandler();
// mqttClient.connect();

app.post("/broadcast", function (req, res) {
  mqttClient.sendMessage(req.body);
  res.status(200).send("Sending");
});

app.listen(port, () => console.log(`CONNECT ${port}`));

module.exports = mqttClient;
