const Room = require("../models/Room");
const {
  getConnectedUsers,
  getConnectedUserByUserId,
} = require("../services/privateChatUserService");

exports.getRooms = async (req, res) => {
  try {
    const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || 5;

    const startIndex = (page - 1) * limit;
    const totalRecords = await Room.totalDocuments();
    const search = `%${req.query.search}%`;

    const rooms = await Room.find({
      startIndex,
      limit,
      search,
      user_id: req.user.user_id,
    });

    return res.json({
      sucess: true,
      data: rooms,
      totalRecords: totalRecords,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

exports.createRoom = async (req, res) => {
  try {
    const roomname = req.body.roomname;
    const users = req.body.users.map((user) => {
      return {
        id: user.value,
      };
    });

    if (!roomname || !!!users.length) {
      return res.status(400).json({
        success: false,
        message: `${
          !roomname
            ? "Roomname must be required"
            : "Atleast one user is required"
        }`,
      });
    }
    users.push({ id: req.user.user_id });

    const newRoom = await Room.create(roomname, req.user.user_id);
    const data = users.map((user) => [newRoom.insertId, user.id]);
    await Room.roomsUsersCreate(data);

    const io = req.app.get("socketIo");

    data.forEach((room) => {
      const user = getConnectedUserByUserId(room[1]);
      if (room[1] !== req.user.user_id && room[1] === user?.userId) {
        io.to(user?.socketId).emit("joinNewRoom", {
          room_id: newRoom.insertId,
          roomname,
          isAdmin: 0,
          message: `${req.user.username} has added you in ${roomname}.`,
        });
      }
    });

    return res.status(201).json({
      success: true,
      room: {
        room_id: newRoom.insertId,
        roomname,
        isAdmin: 1,
      },
      message: "Room created successfully",
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      message: "internel server error",
    });
  }
};

exports.getRoomInfo = async (req, res) => {
  try {
    const roomId = req.params.roomId * 1;

    const room = await Room.findRoomInfoByRoomId(roomId);

    return res.json({
      success: true,
      data: room,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      message: "internel server error",
    });
  }
};

exports.leaveRoom = async (req, res) => {
  try {
    const roomId = req.params.roomId * 1;
    const userId = req.user.user_id;
    await Room.findByIdAndDeleteRoomUser(roomId, userId);
    const owner_id = await Room.getRoomOwnerId(roomId);

    if (owner_id === userId) {
      await Room.updateRoomOwner(roomId);
      const room = await Room.findById(roomId);
      const user = getConnectedUserByUserId(room.owner_id);
      if (!!user) {
        const io = req.app.get("socketIo");
        io.to(user.socketId).emit("updateAdmin", {
          room_id: room.room_id,
          message: `You are now admin of the ${room.roomname}`,
        });
      }
    }
    return res.json({
      success: true,
      message: "Successfully leave",
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      message: "internel server error",
    });
  }
};

exports.updateRoom = async (req, res) => {
  try {
    const roomId = req.params.roomId * 1;
    const roomname = req.body.roomname;
    const users = req.body.users.map((user) => {
      return [roomId, user.value];
    });
    const ownerId = req.user.user_id;
    const usersBefore = (await Room.findRoomInfoByRoomId(roomId))
      .map((user) => user.user_id)
      .filter((id) => id !== ownerId);
    const usersNow = users.map((user) => user[1]);

    // newUsers
    const newUsers = usersNow.filter(
      (id) => usersBefore.indexOf(id) === -1 && getConnectedUserByUserId(id)
    );

    // deletedUsers
    const deletedUsers = usersBefore.filter(
      (id) => usersNow.indexOf(id) === -1 && getConnectedUserByUserId(id)
    );

    // updatedUsers
    const updatedUsers = usersBefore.filter(
      (id) => usersNow.indexOf(id) !== -1 && getConnectedUserByUserId(id)
    );

    const room = await Room.findById(roomId);
    if (room.owner_id !== ownerId) {
      return res.status(401).json({
        status: false,
        message: "You are not allowed to update this room",
      });
    }
    await Room.findByIdAndUpdateRoomInfo(roomId, ownerId, roomname, users);

    const io = req.app.get("socketIo");

    newUsers.forEach((id) => {
      io.to(getConnectedUserByUserId(id)?.socketId).emit("joinNewRoom", {
        room_id: roomId,
        roomname,
        isAdmin: 0,
        message: `${req.user.username} has added you in ${roomname}`,
      });
    });

    deletedUsers.forEach((id) => {
      io.to(getConnectedUserByUserId(id)?.socketId).emit("KickedOutFromRoom", {
        room_id: roomId,
        message: `${req.user.username} has kickedout you from ${roomname}`,
      });
    });

    updatedUsers.forEach((id) => {
      io.to(getConnectedUserByUserId(id)?.socketId).emit("updateRoomName", {
        room_id: roomId,
        roomname: roomname,
      });
    });

    return res.json({
      sucess: true,
      data: "",
      message: "Room updated successfully",
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      message: "internel server error",
    });
  }
};

exports.getRoomMessages = async (req, res) => {
  try {
    const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || 5;
    const userId = req.user.user_id;
    const roomId = req.query.room_id;

    if (!page || !limit || !userId || !roomId) {
      return res.status(400).json({
        success: false,
        message: "invalid data",
      });
    }

    const startIndex = (page - 1) * limit;
    const totalRecords = await Room.totalRoomMessages(roomId);

    const data = await Room.getRoomMessagesById(
      userId,
      roomId,
      startIndex,
      limit
    );

    return res.json({
      success: true,
      data,
      totalRecords,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      message: "internel server error",
    });
  }
};
