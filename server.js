const express = require("express");
const app = express();
const fileUpload = require("express-fileupload");
const socketIo = require("socket.io");
const PORT = process.env.PORT || 3001;

// routes
const ckEditorRoute = require("./routes/ckEditor");
const signatureRoute = require("./routes/signature");

// services
const { addUser, removeUser } = require("./services/userService");

app.use(express.json({ limit: 500000 }));
app.use(express.static("public"));
app.use(fileUpload());

app.use("/ck", ckEditorRoute);
app.use("/signature", signatureRoute);

const server = app.listen(
  PORT,
  console.log(`server is running on port ${PORT}`)
);

const io = socketIo(server, {
  origin: "*",
  methods: ["GET", "POST"],
});

io.on("connection", (socket) => {
  socket.on("joinChatRoom", (username) => {
    addUser({ username, id: socket.id });
    socket.join("chat");
    socket.to("chat").emit("message", {
      message: `${username} is joined!`,
      by: "admin",
    });
  });

  socket.on("message", (data) => {
    socket.to("chat").emit("message", data);
  });

  socket.on("typing", (data) => {
    socket.to("chat").emit("typing", data);
  });

  socket.on("disconnect", () => {
    console.log("disconnected");
    removeUser(socket.id);
  });
});
