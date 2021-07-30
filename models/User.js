const dbCon = require("../config/db.config");
const bcrypt = require("bcryptjs");

const User = function () {};

const hashPassword = async (password) => {
  return await bcrypt.hash(password, 10);
};

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
    data = [username, email, await hashPassword(password)];

    dbCon.query(query, data, (err, res) => {
      if (err) return reject(err);
      else return resolve(res);
    });
  });

module.exports = User;
