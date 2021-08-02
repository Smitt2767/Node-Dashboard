require("dotenv").config();
const express = require("express");
const app = express();
const fileUpload = require("express-fileupload");
const socketIo = require("socket.io");

const cors = require("cors");

const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json({ limit: 500000 }));
app.use(express.static("public"));
app.use(fileUpload());

// Server
const server = app.listen(
  PORT,
  console.log(`server is running on port ${PORT}`)
);

// Socket
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

module.exports = {
  app,
  io,
};
