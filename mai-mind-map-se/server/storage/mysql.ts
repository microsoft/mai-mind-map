import mysql from 'mysql';
import { readConfig } from '../utils';

const config = readConfig();

// Initialize pool
const pool = mysql.createPool({
  connectionLimit: config.DB_CONN_LIMIT,
  host: config.DB_HOST,
  port: config.DB_PORT,
  user: config.DB_USER,
  password: config.DB_SECRET,
  database: config.DB_NAME,
  debug: false
});

module.exports = pool;
