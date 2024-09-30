import { OkPacket } from 'mysql';
import { Request } from 'express';
import { executeQuery } from './pool';
import { handleError } from '../utils';
import { CustomSession } from '../controllers/users';

export async function getUID(req: Request): Promise<string | undefined> {
  const accountID = (req.session as CustomSession).account?.localAccountId;
  if (accountID === undefined) {
    return undefined;
  }
  const result = await GetUserByLocalAccountID(accountID);
  if (result.rows.length === 0) {
    return undefined;
  }
  return result.rows[0].id;
}

/**
 * Retrieves a user by their local account ID.
 *
 * @param localAccountID - The local account ID of the user to retrieve.
 * @returns A promise that resolves to an object containing the rows of the
 * query result.
 * @throws Will throw an error if the query fails.
 */
export function GetUserByLocalAccountID(localAccountID: string):
  Promise<{ rows: any }> {
  return new Promise((resolve, reject) => {
    executeQuery(`SELECT id FROM users WHERE
      local_account_id = "${localAccountID}";`, (err, result) => {
      if (result) {
        resolve(result);
      } else {
        reject(handleError(err));
      }
    });
  });
}

/**
 * Adds a new user to the database.
 *
 * @param account - An object containing user account details.
 * @param account.name - The name of the user.
 * @param account.username - The email of the user.
 * @param account.homeAccountId - The home account ID of the user.
 * @param account.localAccountId - The local account ID of the user.
 * @param account.tenantId - The tenant ID of the user.
 * @returns A promise that resolves with the result of the database insertion.
 */
export function AddUser(account: any): Promise<{ rows: OkPacket }> {
  return new Promise((resolve, reject) => {
    executeQuery(`INSERT INTO users
      (name, email, home_account_id, local_account_id, tenant_id)
    VALUES (
      "${account.name}",
      "${account.username}",
      "${account.homeAccountId}",
      "${account.localAccountId}",
      "${account.tenantId}"
      );`, (err, result) => {
      if (result) {
        resolve(result);
      } else {
        reject(handleError(err));
      }
    });
  });
}
