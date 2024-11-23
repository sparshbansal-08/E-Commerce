const port = 4000;
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
const { error } = require("console");

app.use(express.json());
app.use(cors());

// Database connection with mongodb
mongoose.connect(
  "mongodb+srv://sparshbansal:sparshbansal@cluster0.vlyh2.mongodb.net/e-commerce"
);
// API Creation

app.get("/", (req, res) => {
  res.send("Express App is running");
});




app.listen(port, (error) => {
  if (!error) {
    console.log("Server Running on port " + port);
  } else {
    console.log("Error in server creation: " + error);
  }
});
