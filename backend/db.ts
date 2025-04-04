import mysql from "mysql2/promise";

// Add this debugging
console.log("DB Connection settings:");
console.log("User:", process.env.DB_USER);
console.log("Host:", process.env.DB_HOST);
console.log("Port:", process.env.DB_PORT);
console.log("Database:", process.env.DB_NAME);
// Don't log the actual password for security

const db = mysql.createPool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export default db;
