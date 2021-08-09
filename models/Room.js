const dbCon = require("../config/db.config");

const Room = function () {};

Room.totalDocuments = () =>
  new Promise((resolve, reject) => {
    const query = `select count(*) as totalRecords from rooms `;
    dbCon.query(query, (err, res) => {
      if (err) return reject(err);
      else resolve(res[0].totalRecords);
    });
  });

Room.find = ({ startIndex, limit, search, user_id }) =>
  new Promise((resolve, reject) => {
    const query = `select room_id, roomname, case when owner_id = ? then true else false end as isAdmin, 
    (select text from room_messages where room_id = r.room_id and isDeleted <> 1 order by message_id desc limit 1) as last_message
    from rooms r 
    left join rooms_users ru using(room_id) 
    left join users u using(user_id) 
    where ru.user_id = ?
    and roomname like ? 
    order by room_id desc
    limit ?, ?`;

    const data = [user_id, user_id, search, startIndex, limit];

    dbCon.query(query, data, (err, res) => {
      if (err) return reject(err);
      else resolve(res);
    });
  });

Room.findAllUserRooms = (user_id) =>
  new Promise((resolve, reject) => {
    const query = `select room_id, roomname
    from rooms r 
    left join rooms_users ru using(room_id) 
    left join users u using(user_id) 
    where ru.user_id = ?
    order by room_id desc`;

    const data = [user_id];

    dbCon.query(query, data, (err, res) => {
      if (err) return reject(err);
      else resolve(res);
    });
  });

Room.create = (roomname, owner_id) =>
  new Promise((resolve, reject) => {
    const query = `insert into rooms values (default, ? , ?)`;
    const data = [roomname, owner_id];

    dbCon.query(query, data, (err, res) => {
      if (err) return reject(err);
      else resolve(res);
    });
  });

Room.roomsUsersCreate = (data) =>
  new Promise((resolve, reject) => {
    const query = `insert into rooms_users values ?`;

    dbCon.query(query, [data], (err, res) => {
      if (err) return reject(err);
      else resolve(res);
    });
  });

Room.findRoomInfoByRoomId = (roomId) =>
  new Promise((resolve, reject) => {
    const query = `select username, user_id, case when owner_id = user_id then true else false end as isAdmin, active
    from rooms left join rooms_users using(room_id) left join users using(user_id) where room_id = ?`;
    const data = [roomId];
    dbCon.query(query, [data], (err, res) => {
      if (err) return reject(err);
      else resolve(res);
    });
  });

Room.findByIdAndUpdateRoomName = (roomId, roomname) =>
  new Promise((resolve, reject) => {
    const query = `update rooms set roomname = ? where room_id = ?`;
    const data = [roomname, roomId];
    dbCon.query(query, [data], (err, res) => {
      if (err) return reject(err);
      else resolve(res);
    });
  });

Room.findByIdAndDeleteRoomUser = (roomId, userId) =>
  new Promise(async (resolve, reject) => {
    const query = "delete from rooms_users where room_id = ? and user_id = ?";
    const data = [roomId, userId];
    dbCon.query(query, data, (err, res) => {
      if (err) return reject(err);
      else resolve(res);
    });
  });

Room.findById = (roomId) =>
  new Promise((resolve, reject) => {
    const query = `select * from rooms where room_id = ?`;
    const data = [roomId];
    dbCon.query(query, data, (err, res) => {
      if (err) return reject(err);
      else resolve(res[0]);
    });
  });

Room.findByIdAndUpdateRoomInfo = (roomId, ownerId, roomname, users) =>
  new Promise((resolve, reject) => {
    const query = `delete from rooms_users where room_id = ? and user_id <> ?; 
      update rooms set roomname = ? where room_id = ?;
      insert into rooms_users values ?`;
    const data = [roomId, ownerId, roomname, roomId, users];

    dbCon.query(query, data, (err, res) => {
      if (err) return reject(err);
      else resolve(res);
    });
  });

Room.getRoomOwnerId = (roomId) =>
  new Promise((resolve, reject) => {
    const query = `select owner_id from rooms where room_id = ?`;
    const data = [roomId];
    dbCon.query(query, data, (err, res) => {
      if (err) return reject(err);
      else resolve(res[0].owner_id);
    });
  });

Room.updateRoomOwner = (roomId) =>
  new Promise((resolve, reject) => {
    const query = `update rooms set owner_id = (select user_id from rooms_users where room_id = ? limit 1) where room_id = ?`;
    const data = [roomId, roomId];
    dbCon.query(query, data, (err, res) => {
      if (err) return reject(err);
      else resolve(res);
    });
  });

Room.getRoomMessagesById = (userId, roomId, startIndex, limit) =>
  new Promise((resolve, reject) => {
    const query = `select rm.message_id, rm.text, rm.type, rm.isEdited, rm.created_at, rm.replyOf, u.username,
     case when u.user_id = ? then true else false end as by_me,
    (select text from room_messages irm where irm.message_id = rm.replyOf ) as replyText
    from rooms r left join room_messages rm using(room_id) left join users u on u.user_id = rm.from_user where room_id = ? and rm.isDeleted = 0 
    order by rm.message_id desc limit ?, ?`;

    const data = [userId, roomId, startIndex, limit];

    dbCon.query(query, data, (err, res) => {
      if (err) return reject(err);
      else resolve(res);
    });
  });

Room.totalRoomMessages = (roomId) =>
  new Promise((resolve, reject) => {
    const query = `select count(*) as totalRecords from room_messages where isDeleted = 0 and room_id = ?`;
    const data = [roomId];

    dbCon.query(query, data, (err, res) => {
      if (err) return reject(err);
      else resolve(res[0].totalRecords);
    });
  });

Room.createNewMessage = ({
  userId,
  roomId,
  message,
  type = "text",
  replyOf = null,
}) =>
  new Promise((resolve, reject) => {
    const query = `insert into room_messages values (default, ?, ?, default, default, default, ?, ?, ? )`;
    const data = [message, type, replyOf, roomId, userId];

    dbCon.query(query, data, (err, res) => {
      if (err) return reject(err);
      else resolve(res);
    });
  });

Room.getMessageById = (id) =>
  new Promise((resolve, reject) => {
    const query = `select message_id, text, type, isEdited, created_at, replyOf, 
    (select username from users where user_id = rm.from_user) as username, from_user,
    (select text from room_messages where message_id = rm.replyOf ) as replyText
    from room_messages rm where message_id = ?`;

    const data = [id];
    dbCon.query(query, data, (err, res) => {
      if (err) return reject(err);
      else resolve(res);
    });
  });

Room.deleteMessage = (message_id) =>
  new Promise((resolve, reject) => {
    const query = `update room_messages set isDeleted = 1 where message_id = ?`;
    const data = [message_id];
    dbCon.query(query, data, (err, res) => {
      if (err) return reject(err);
      else resolve(res);
    });
  });

Room.updateMessage = ({ message_id, message }) =>
  new Promise((resolve, reject) => {
    const query = `update room_messages set text = ?, isEdited = 1 where message_id = ?`;
    const data = [message, message_id];

    dbCon.query(query, data, (err, res) => {
      if (err) return reject(err);
      else resolve(res);
    });
  });

module.exports = Room;
