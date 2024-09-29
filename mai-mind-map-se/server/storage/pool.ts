import { Pool, PoolConnection } from 'mysql';
const pool: Pool = require('./mysql');

interface QueryCallback {
  (error: Error | null, result?: { rows: any }): void;
}

/**
 * Executes a SQL query using a connection from the pool.
 *
 * @param query - The SQL query string to be executed.
 * @param callback - A callback function that handles the result of the query.
 *
 * @throws Will throw an error if there is an issue obtaining a connection or
 * executing the query.
 */
export function executeQuery(query: string, callback: QueryCallback): void {
  pool.getConnection((err: Error, connection: PoolConnection) => {
    if (err) {
      if (connection) connection.release();
      throw err;
    }

    connection.query(query, (err: Error, rows: any) => {
      connection.release();
      if (!err) {
        callback(null, { rows });
      } else {
        callback(err);
      }
    });

    connection.on('error', (err: Error) => {
      throw err;
    });
  });
}
