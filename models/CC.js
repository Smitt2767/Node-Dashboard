const dbCon = require("../config/db.config");

const CC = function () {};

CC.create = ({
  userId,
  cardHolderName,
  cardNumber,
  expiryMonth,
  expiryYear,
  cvv,
  balance,
}) =>
  new Promise((resolve, reject) => {
    const query = `insert into cc_details (card_holder_name, card_number, expiry_month, expiry_year, cvv, balance, user_id) values (?,?,?,?,?,?,?)`;

    const data = [
      cardHolderName,
      cardNumber,
      expiryMonth,
      expiryYear,
      cvv,
      balance,
      userId,
    ];

    dbCon.query(query, data, (err, res) => {
      if (err) return reject(err);
      else return resolve(res);
    });
  });

CC.find = ({ startIndex, limit, user_id }) =>
  new Promise((resolve, reject) => {
    const query = `select cc_id, card_holder_name, card_number , expiry_month, expiry_year, cvv, balance from cc_details where user_id = ? limit ?, ?`;
    const data = [user_id, startIndex, limit];
    dbCon.query(query, data, (err, res) => {
      if (err) return reject(err);
      else return resolve(res);
    });
  });

CC.findById = (id) =>
  new Promise((resolve, reject) => {
    const query = `select * from cc_details where cc_id = ?`;
    const data = [id];

    dbCon.query(query, data, (err, res) => {
      if (err) return reject(err);
      else return resolve(res[0]);
    });
  });

CC.findByIdAndDelete = (id) =>
  new Promise((resolve, reject) => {
    const query = `delete from cc_details where cc_id = ?`;
    const data = [id];

    dbCon.query(query, data, (err, res) => {
      if (err) return reject(err);
      else return resolve(res);
    });
  });

CC.totalDocuments = (userId) =>
  new Promise((resolve, reject) => {
    const query = `select count(*) as totalRecords from cc_details where user_id = ?`;
    const data = [userId];
    dbCon.query(query, data, (err, res) => {
      if (err) return reject(err);
      else return resolve(res[0].totalRecords);
    });
  });

CC.findByIdAndUpdate = ({
  id,
  userId,
  cardHolderName,
  cardNumber,
  expiryMonth,
  expiryYear,
  cvv,
  balance,
}) =>
  new Promise((resolve, reject) => {
    const query = `update cc_details set card_holder_name = ?, card_number = ?, expiry_month = ?, expiry_year = ?, cvv = ?, balance = ? where cc_id = ? and user_id = ?`;
    const data = [
      cardHolderName,
      cardNumber,
      expiryMonth,
      expiryYear,
      cvv,
      balance,
      id,
      userId,
    ];
    dbCon.query(query, data, (err, res) => {
      if (err) return reject(err);
      else return resolve(res);
    });
  });

module.exports = CC;
