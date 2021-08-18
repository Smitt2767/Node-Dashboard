const dbCon = require("../config/db.config");

const Olympic = function () {};

Olympic.create = (values) =>
  new Promise((resolve, reject) => {
    const query = `insert into olympic (athlete, age, country, year, date, sport, gold, silver, bronze) values ?`;
    const data = [values];
    dbCon.query(query, data, (err, res) => {
      if (err) return reject(err);
      else resolve(res);
    });
  });

Olympic.find = ({ sort, order, start, limit, where }) =>
  new Promise((resolve, reject) => {
    const query = `select * from  olympic ${
      where ? `where ${where}` : ""
    } order by ${sort} ${order} limit ?, ?`;
    const data = [start, limit];
    dbCon.query(query, data, (err, res) => {
      if (err) return reject(err);
      else resolve(res);
    });
  });

Olympic.totalRecords = (where) =>
  new Promise((resolve, reject) => {
    const query = `select count(*) as totalRecords from olympic ${
      where ? `where ${where}` : ""
    } `;
    dbCon.query(query, (err, res) => {
      if (err) return reject(err);
      else resolve(res[0].totalRecords);
    });
  });

module.exports = Olympic;
