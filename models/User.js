const dbCon = require("../config/db.config");
const bcrypt = require("bcryptjs");

const User = function () {};

const hashPassword = async (password) => {
  return await bcrypt.hash(password, 10);
};

User.find = ({ user_id, startIndex, limit, search }) =>
  new Promise((resolve, reject) => {
    const query = `select user_id, username, email, active, gender, avatar, last_active, 
                  (select m.text from messages m where (from_user = ? or to_user = ?) and (from_user = user_id or to_user = user_id)
                   and isDeleted <> 1 order by message_id desc limit 1) as last_message, 
                  (select count(case when isRead = 0 then isRead end) from messages where from_user = user_id and to_user = ? and isDeleted <> 1) 
                  as totalUnRead
                  from users u 
                  where user_id != ? 
                  and username like ?
                  limit ?, ?`;

    const data = [
      user_id,
      user_id,
      user_id,
      user_id,
      search,
      startIndex,
      limit,
    ];

    dbCon.query(query, data, (err, res) => {
      if (err) return reject(err);
      else return resolve(res);
    });
  });

User.findById = (id) =>
  new Promise((resolve, reject) => {
    const query = `select * from users where user_id = ?`;
    const data = [id];

    dbCon.query(query, data, (err, res) => {
      if (err) return reject(err);
      else return resolve(res[0]);
    });
  });

User.findByEmail = (email) =>
  new Promise((resolve, reject) => {
    const query = `select * from users where email = ?`;
    const data = [email];

    dbCon.query(query, data, (err, res) => {
      if (err) return reject(err);
      else return resolve(res);
    });
  });

User.create = (username, email, password) =>
  new Promise(async (resolve, reject) => {
    const query = `insert into users (username, email, password) values(?, ?, ?)`;
    const data = [username, email, await hashPassword(password)];

    dbCon.query(query, data, (err, res) => {
      if (err) return reject(err);
      else return resolve(res);
    });
  });

User.setActive = (id, value) =>
  new Promise((resolve, reject) => {
    const query = `update users set active = ?, last_active = now() where user_id = ? `;
    const data = [value, id];

    dbCon.query(query, data, (err, res) => {
      if (err) return reject(err);
      else return resolve(res);
    });
  });

User.totalDocuments = () =>
  new Promise((resolve, reject) => {
    const query = `select count(*) totalRecords from users`;
    dbCon.query(query, (err, res) => {
      if (err) reject(err);
      else resolve(res[0].totalRecords);
    });
  });

// ,
//         case when m.type = 'file' then (select CONCAT(
//           '[', group_concat(JSON_OBJECT('file_id', f.file_id, 'file_name', f.file_name, 'type', f.type, 'path', f.path )),
//           ']'
//         ) as files from files f group by m.message_id) else null end as files

User.getUserMessages = (fromId, toId, startIndex, limit) =>
  new Promise((resolve, reject) => {
    const query = `select m.*,
          case when from_user = ? then true else false end as by_me,
          (select text from messages rm where message_id = m.replyOf ) as replyText
          from messages m
          where (from_user = ? or from_user = ?) and (to_user = ? or to_user = ?) and isDeleted = 0
          order by message_id desc 
          limit ?, ?`;
    const data = [fromId, fromId, toId, fromId, toId, startIndex, limit];

    dbCon.query(query, data, (err, res) => {
      if (err) reject(err);
      else resolve(res);
    });
  });

User.totalUserMessages = (fromId, toId) =>
  new Promise((resolve, reject) => {
    const query = `select count(*) as totalRecords from messages where (from_user = ? or from_user = ?) and (to_user = ? or to_user = ?) and isDeleted = 0`;
    const data = [fromId, toId, fromId, toId];
    dbCon.query(query, data, (err, res) => {
      if (err) reject(err);
      else resolve(res[0].totalRecords);
    });
  });

module.exports = User;
