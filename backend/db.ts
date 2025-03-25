import mysql from 'mysql2/promise';

const db = mysql.createPool({
    user: process.env.DB_USER || 'sammy',
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3307,
    password: process.env.DB_PASSWORD || 'Nogamenolife1',
    database: process.env.DB_NAME || 'mimuco',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

export default db;
