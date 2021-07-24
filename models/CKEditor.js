const dbCon = require("../config/db.config");

const CKEdiotr = function () {};

CKEdiotr.create = (ckdata) =>
  new Promise((resolve, reject) => {
    const query = `insert into ckeditor
                values(default, ?)`;
    const data = [JSON.stringify(ckdata)];

    dbCon.query(query, data, (err, res) => {
      if (err) reject(err);
      else resolve(res);
    });
  });

CKEdiotr.find = () =>
  new Promise((resolve, reject) => {
    const query = `select * from ckeditor`;
    dbCon.query(query, (err, res) => {
      if (err) reject(err);
      else resolve(res);
    });
  });

CKEdiotr.findByIdAndDelete = (id) =>
  new Promise((resolve, reject) => {
    const query = `delete from ckeditor where id = ? `;
    data = [id];
    dbCon.query(query, data, (err, res) => {
      if (err) reject(err);
      else resolve(res);
    });
  });
CKEdiotr.findByIdAndUpdate = ({ id, data }) =>
  new Promise((resolve, reject) => {
    const query = `update ckeditor set data = ? where id = ? `;
    data = [JSON.stringify(data), id];
    dbCon.query(query, data, (err, res) => {
      if (err) reject(err);
      else resolve(res);
    });
  });

CKEdiotr.findById = (id) =>
  new Promise((resolve, reject) => {
    const query = `select * from ckeditor where id = ? `;
    data = [id];
    dbCon.query(query, data, (err, res) => {
      if (err) reject(err);
      else resolve(res);
    });
  });

module.exports = CKEdiotr;
