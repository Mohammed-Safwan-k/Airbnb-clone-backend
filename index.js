const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const homeRoute = require("./routes/User");

const app = express();

app.use(express.json());
app.use(
  cors({
    credentials: true,
    origin: "http://127.0.0.1:5173",
  })
);

mongoose.connect(process.env.MONGO_URL);

app.get("/test", (req, res) => {
  res.json("test ok");
});

app.use("/", homeRoute);

app.listen(4000);
