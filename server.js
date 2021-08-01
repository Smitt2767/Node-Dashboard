require("dotenv").config();
const express = require("express");
const app = express();
const fileUpload = require("express-fileupload");
const socketIo = require("socket.io");
const jwt = require("jsonwebtoken");
const cors = require("cors");

// routes
const ckEditorRoute = require("./routes/ckEditor");
const signatureRoute = require("./routes/signature");
const authRoute = require("./routes/auth");
const userRoute = require("./routes/users");

// services
const {
  addUser,
  removeUser,
  getUsers,
  getUserById,
} = require("./services/userService");

const {
  addConnectedUser,
  removeConnectedUser,
} = require("./services/privateChatUserService");

// Models
const User = require("./models/User");

const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json({ limit: 500000 }));
app.use(express.static("public"));
app.use(fileUpload());

app.use("/ck", ckEditorRoute);
app.use("/signature", signatureRoute);
app.use("/auth", authRoute);
app.use("/users", userRoute);

const server = app.listen(
  PORT,
  console.log(`server is running on port ${PORT}`)
);

const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    let user;
    let error;
    if (!token) {
      error = new Error("Not authorized");
    } else {
      const decode = await jwt.verify(token, process.env.JWT_SECRET);
      user = await User.findById(decode.id);
      if (user) await User.setActive(user.user_id, true);
      else error = new Error("Not authorized");
    }

    addConnectedUser({
      socketId: socket.id,
      userId: user.user_id,
      username: user.username,
    });

    next(error);
  } catch (err) {
    error = new Error(err);
    next(err);
  }
});

io.on("connection", async (socket) => {
  const userId = await jwt.verify(
    socket.handshake.auth?.token,
    process.env.JWT_SECRET
  ).id;

  socket.broadcast.emit("broadcast-user", {
    type: "ONLINE",
    userId,
  });

  // Chat room
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

  socket.on("disconnect", async () => {
    try {
      await User.setActive(userId, false);
      removeConnectedUser(socket.id);
      socket.broadcast.emit("broadcast-user", {
        type: "OFFLINE",
        userId,
      });
    } catch (err) {
      console.log(err);
    }

    // Chat room
    const username = getUserById(socket.id)?.username;
    if (username) {
      removeUser(socket.id);
      io.to("chat").emit("broadcast", {
        type: "USERS",
        users: getUsers(socket.id),
      });

      socket.to("chat").emit("message", {
        message: `${username} has left!`,
        by: "admin",
      });
      socket.leave("chat");
    }
  });
});
