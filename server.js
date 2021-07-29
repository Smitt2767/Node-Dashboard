const express = require("express");
const app = express();
const fileUpload = require("express-fileupload");
const socketIo = require("socket.io");
const PORT = process.env.PORT || 3001;

// routes
const ckEditorRoute = require("./routes/ckEditor");
const signatureRoute = require("./routes/signature");
const authRoute = require("./routes/auth");

// services
const {
  addUser,
  removeUser,
  getUsers,
  getUserById,
} = require("./services/userService");

app.use(express.json({ limit: 500000 }));
app.use(express.static("public"));
app.use(fileUpload());

app.use("/ck", ckEditorRoute);
app.use("/signature", signatureRoute);
app.use("/auth", authRoute);

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
    io.to("chat").emit("broadcast", {
      type: "USERS",
      users: getUsers(socket.id),
    });
    io.to(socket.id).emit("message", {
      message: `Hey ${username}, Welcome to chat room!!!`,
      by: "admin",
    });
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
    const username = getUserById(socket.id)?.username;

    removeUser(socket.id);
    io.to("chat").emit("broadcast", {
      type: "USERS",
      users: getUsers(socket.id),
    });

    socket.to("chat").emit("message", {
      message: `${username} has left!`,
      by: "admin",
    });
  });
});
