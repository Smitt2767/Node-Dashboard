const { io } = require("../server");
const { app } = require("../server");
const jwt = require("jsonwebtoken");

// models
const User = require("../models/User");
const Message = require("../models/Message");

// services
const {
  addUser,
  removeUser,
  getUsers,
  getUserById,
} = require("../services/userService");

const {
  addConnectedUser,
  removeConnectedUser,
  getConnectedUserBySocketId,
  getConnectedUserByUserId,
} = require("../services/privateChatUserService");

io.of("/").use(async (socket, next) => {
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
  const userId = getConnectedUserBySocketId(socket.id)?.userId;
  SOCKET = socket;
  socket.broadcast.emit("broadcast-user", {
    type: "ONLINE",
    userId,
  });

  socket.on("sendMessageToUser", async (data, cb) => {
    try {
      const newMessage = await Message.create({
        text: data.message,
        from_user: userId,
        to_user: data.to_user,
        replyOf: data.replyOf,
      });
      const message = await Message.findById(newMessage.insertId);
      const toUser = getConnectedUserByUserId(data.to_user);

      if (toUser) {
        io.to(toUser.socketId).emit("sendMessageToUser", message);
      }

      cb(message);
    } catch (err) {
      console.log(err);
      io.to(socket.id).emit("ERROR", "Invalid data");
    }
  });

  socket.on("messageRead", async ({ messageId, senderId }) => {
    try {
      await Message.updateAndSetMessageRead(messageId);
      const sender = getConnectedUserByUserId(senderId);
      if (!!sender) {
        socket.to(sender.socketId).emit("userReadYourMessage", messageId);
      }
    } catch (err) {
      io.to(socket.id).emit("ERROR", "Invalid data");
    }
  });

  socket.on("updateIsRead", async (senderId) => {
    try {
      const receiverId = userId;
      if (!receiverId || !senderId) throw new Error("");
      await Message.updateMessagesIsRead(senderId, receiverId);

      const sender = getConnectedUserByUserId(senderId);
      if (!!sender) {
        socket.to(sender.socketId).emit("updateIsRead", receiverId);
      }
    } catch (err) {
      io.to(socket.id).emit("ERROR", "Invalid data");
    }
  });

  socket.on("sendTypingStatus", (receiverId) => {
    const receiver = getConnectedUserByUserId(receiverId);
    if (!!receiver) {
      socket.to(receiver.socketId).emit("sendTypingStatus", userId);
    }
  });

  socket.on("deleteMessage", async ({ messageId, receiverId }, cb) => {
    try {
      await Message.findByIdAndDelete(messageId);
      const receiver = getConnectedUserByUserId(receiverId);
      if (!!receiver) {
        socket
          .to(receiver.socketId)
          .emit("deleteMessage", { messageId, senderId: userId });
      }

      cb();
    } catch (err) {
      io.to(socket.id).emit("ERROR", "Invalid data");
    }
  });

  socket.on("updateMessage", async ({ receiverId, message, messageId }, cb) => {
    try {
      await Message.findByIdAndUpdateText(message, messageId);
      const receiver = getConnectedUserByUserId(receiverId);
      if (!!receiver) {
        socket
          .to(receiver.socketId)
          .emit("updateMessage", { messageId, message, senderId: userId });
      }

      cb();
    } catch (err) {
      console.log(err);
      io.to(socket.id).emit("ERROR", "Invalid data");
    }
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
  });
});

// Global Chat
io.of("/globalChat").on("connection", (socket) => {
  socket.on("joinChatRoom", (username) => {
    addUser({ username, id: socket.id });
    socket.join("chat");
    io.of("/globalChat")
      .to("chat")
      .emit("broadcast", {
        type: "USERS",
        users: getUsers(socket.id),
      });
    io.of("/globalChat")
      .to(socket.id)
      .emit("message", {
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
    const username = getUserById(socket.id)?.username;
    if (username) {
      removeUser(socket.id);
      io.of("/globalChat")
        .to("chat")
        .emit("broadcast", {
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
