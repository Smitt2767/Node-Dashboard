const dbCon = require("../config/db.config");

const CKEdiotr = function () {};

CKEdiotr.create = (ckdata, user_id) =>
  new Promise((resolve, reject) => {
    const query = `insert into ckeditor
                values(default, ?, ?)`;
    const data = [JSON.stringify(ckdata), user_id];

    dbCon.query(query, data, (err, res) => {
      if (err) reject(err);
      else resolve(res);
    });
  });

CKEdiotr.find = ({ startIndex, limit, user_id }) =>
  new Promise((resolve, reject) => {
    const query = `select * from ckeditor where user_id = ? limit ? , ? `;
    const data = [user_id, startIndex, limit];
    dbCon.query(query, data, (err, res) => {
      if (err) reject(err);
      else resolve(res);
    });
  });

CKEdiotr.totalDocuments = (user_id) =>
  new Promise((resolve, reject) => {
    const query = `select count(*) totalRecords from ckeditor where user_id = ?`;
    const data = [user_id];
    dbCon.query(query, data, (err, res) => {
      if (err) reject(err);
      else resolve(res[0].totalRecords);
    });
  });

CKEdiotr.findByIdAndDelete = (id) =>
  new Promise((resolve, reject) => {
    const query = `delete from ckeditor where ck_id = ?`;
    data = [id];
    dbCon.query(query, data, (err, res) => {
      if (err) reject(err);
      else resolve(res);
    });
  });
CKEdiotr.findByIdAndUpdate = ({ id, data }) =>
  new Promise((resolve, reject) => {
    const query = `update ckeditor set data = ? where ck_id = ? `;
    data = [JSON.stringify(data), id];
    dbCon.query(query, data, (err, res) => {
      if (err) reject(err);
      else resolve(res);
    });
  });

CKEdiotr.findById = (id) =>
  new Promise((resolve, reject) => {
    const query = `select * from ckeditor where ck_id = ? `;
    data = [id];
    dbCon.query(query, data, (err, res) => {
      if (err) reject(err);
      else resolve(res[0]);
    });
  });

module.exports = CKEdiotr;
