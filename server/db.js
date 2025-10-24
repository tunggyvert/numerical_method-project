const mysql = require("mysql2");
const dotenv = require("dotenv");
dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
};

function connectWithRetry() {
  return new Promise((resolve, reject) => {
    const db = mysql.createConnection(dbConfig);

    const tryConnect = () => {
      db.connect((err) => {
        if (err) {
          console.log("DB not ready, retrying in 2s...", err.code);
          setTimeout(tryConnect, 2000);
        } else {
          console.log("Connected to DB!");
          resolve(db);
        }
      });
    };

    tryConnect();
  });
}

module.exports = connectWithRetry;
