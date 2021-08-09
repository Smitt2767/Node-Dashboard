const { io } = require("../server");
const jwt = require("jsonwebtoken");

// models
const User = require("../models/User");
const Message = require("../models/Message");
const Room = require("../models/Room");
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
  socket.broadcast.emit("broadcast-user", {
    type: "ONLINE",
    userId,
  });
  try {
    const usersRooms = await Room.findAllUserRooms(userId);
    usersRooms.forEach((room) => {
      socket.join(`#room_${room.room_id}`);
    });
  } catch (err) {
    io.to(socket.id).emit("ERROR", "Something went wrong!!!");
  }

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

  socket.on(
    "deleteMessage",
    async ({ messageId, receiverId, isLast, lastMessage }, cb) => {
      try {
        await Message.findByIdAndDelete(messageId);
        const receiver = getConnectedUserByUserId(receiverId);
        if (!!receiver) {
          socket.to(receiver.socketId).emit("deleteMessage", {
            messageId,
            senderId: userId,
            isLast,
            lastMessage,
          });
        }

        cb();
      } catch (err) {
        io.to(socket.id).emit("ERROR", "Invalid data");
      }
    }
  );

  socket.on(
    "updateMessage",
    async ({ receiverId, message, messageId, isLast }, cb) => {
      try {
        await Message.findByIdAndUpdateText(message, messageId);
        const receiver = getConnectedUserByUserId(receiverId);
        if (!!receiver) {
          socket.to(receiver.socketId).emit("updateMessage", {
            messageId,
            message,
            senderId: userId,
            isLast,
          });
        }

        cb();
      } catch (err) {
        console.log(err);
        io.to(socket.id).emit("ERROR", "Invalid data");
      }
    }
  );

  // Rooms
  socket.on("join", (room_id) => {
    socket.join(`#room_${room_id}`);
  });

  socket.on("leave", (room_id) => {
    socket.leave(`#room_${room_id}`);
  });

  socket.on("room_new_message", async (data, cb) => {
    try {
      const newMessage = await Room.createNewMessage({
        userId,
        roomId: data.room_id,
        message: data.message,
        replyOf: data.replyOf,
      });
      const message = await Room.getMessageById(newMessage.insertId);

      socket.to(`#room_${data.room_id}`).emit("room_new_message", {
        message: { ...message[0], by_me: 0 },
        roomId: data.room_id,
      });

      cb({
        message: { ...message[0], by_me: 1 },
        roomId: data.room_id,
      });
    } catch (err) {
      console.log(err);
      io.to(socket.id).emit("ERROR", "Invalid data");
    }
  });

  socket.on("who_is_typing", (room_id) => {
    const username = getConnectedUserByUserId(userId)?.username;

    socket.to(`#room_${room_id}`).emit("who_is_typing", { username, room_id });
  });

  socket.on(
    "deleteRoomMessage",
    async ({ message_id, room_id, isLast, last_message }) => {
      try {
        await Room.deleteMessage(message_id);
        io.to(`#room_${room_id}`).emit("deleteRoomMessage", {
          message_id,
          room_id,
          isLast,
          last_message,
        });
      } catch (err) {
        io.to(socket.id).emit("ERROR", "Invalid data");
      }
    }
  );

  socket.on(
    "updateRoomMessage",
    async ({ room_id, message_id, message, isLast }) => {
      try {
        await Room.updateMessage({ message_id, message });
        io.to(`#room_${room_id}`).emit("updateRoomMessage", {
          message_id,
          room_id,
          message,
          isLast,
        });
      } catch (err) {
        console.log(err);
        io.to(socket.id).emit("ERROR", "Invalid data");
      }
    }
  );

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
