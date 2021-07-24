const mysql = require("mysql2");

const dbCon = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "password",
  database: "dashboard",
});

dbCon.connect((err) => {
  if (err) console.log("Database connection faild");
  console.log("Database connected ");
});

module.exports = dbCon;
