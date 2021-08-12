const dbCon = require("../config/db.config");

const Message = function () {};

Message.create = ({
  text,
  type = "text",
  from_user,
  to_user,
  replyOf = null,
}) =>
  new Promise((resolve, reject) => {
    const query = `insert into messages (text, type, from_user, to_user, replyOf ) values(?,?,?,?,?)`;
    const data = [text, type, from_user, to_user, replyOf];

    dbCon.query(query, data, (err, res) => {
      if (err) return reject(err);
      else resolve(res);
    });
  });

Message.findById = (id) =>
  new Promise((resolve, reject) => {
    const query = `select *,
                  (select text from messages rm where message_id = m.replyOf ) as replyText,
                  (select concat('[', group_concat(JSON_OBJECT('file_id', file_id, 'name', name, 'path', path,'size', size, 'type', type)) , ']') from files f where f.message_id = m.message_id group by message_id) as files
                  from messages m where message_id = ?`;

    const data = [id];

    dbCon.query(query, data, (err, res) => {
      if (err) return reject(err);
      else resolve(res[0]);
    });
  });

Message.updateAndSetMessageRead = (id) =>
  new Promise((resolve, reject) => {
    const query = `update messages set isRead = 1 where message_id = ?`;
    const data = [id];

    dbCon.query(query, data, (err, res) => {
      if (err) return reject(err);
      else resolve(res);
    });
  });

Message.updateMessagesIsRead = (senderId, receiverId) =>
  new Promise((resolve, reject) => {
    const query = `update messages set isRead = 1 where from_user = ? and to_user = ? and isRead = 0`;
    const data = [senderId, receiverId];
    dbCon.query(query, data, (err, res) => {
      if (err) return reject(err);
      else resolve(res);
    });
  });

Message.findByIdAndDelete = (id) =>
  new Promise((resolve, reject) => {
    const query = `update messages set isDeleted = 1 where message_id = ?`;
    const data = [id];
    dbCon.query(query, data, (err, res) => {
      if (err) return reject(err);
      else resolve(res);
    });
  });

Message.findByIdAndUpdateText = (text, messageId) =>
  new Promise((resolve, reject) => {
    const query = `update messages set text = ?, isEdited = 1 where message_id = ?`;
    const data = [text, messageId];
    dbCon.query(query, data, (err, res) => {
      if (err) return reject(err);
      else resolve(res);
    });
  });

Message.createFile = (filesData) =>
  new Promise((resolve, reject) => {
    const query = `insert into files (name, path, size, type, message_id) values ?`;

    dbCon.query(query, [filesData], (err, res) => {
      if (err) return reject(err);
      else resolve(res);
    });
  });

module.exports = Message;
