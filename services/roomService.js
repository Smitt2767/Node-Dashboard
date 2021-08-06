const Room = require("../models/Room");
let rooms = [];

exports.setRooms = async () => {
  try {
    const data = await Room.findForService();
    if (data.length) {
      rooms = data.map((room) => {
        return {
          room_id: room.room_id,
          roomname: room.roomname,
          room_uid: `${room.roomname}_${room.room_id}`,
        };
      });
    }
  } catch (err) {
    console.log(err);
  }
};

exports.addRoom = (room_id, roomname) => {
  rooms.push({
    room_id: room_id,
    roomname: roomname,
    room_uid: `${roomname}_${room_id}`,
  });
  console.log(rooms);
};
