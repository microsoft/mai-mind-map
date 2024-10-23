import { OkPacket } from 'mysql';
import { handleError } from '../utils';
import { executeQuery } from './pool';

/**
 * Adds a document to the database for a given user.
 *
 * @param uid - The unique identifier of the user.
 * @param docID - The unique identifier of the document.
 * @returns A promise that resolves to an object containing the rows of the
 * query result.
 * */
export function AddDoc(uid: string, docID: string, title:string): Promise<{ rows: OkPacket }> {
  return new Promise((resolve, reject) => {
    executeQuery(`INSERT INTO docs
      (uid, doc_id, title) VALUES ("${uid}", "${docID}", "${title}");`, (err, result) => {
      if (result) {
        resolve(result);
      } else {
        reject(handleError(err));
      }
    });
  });
}

/**
 * Retrieves a document by user ID and document ID from the database.
 *
 * @param uid - The unique identifier of the user.
 * @param docID - The unique identifier of the document.
 * @returns A promise that resolves to an object containing the rows of the
 * query result.
 */
export function GetDocByUID(uid: string, docID: string): Promise<{ rows: any }> {
  return new Promise((resolve, reject) => {
    executeQuery(`SELECT doc_id FROM docs WHERE
      doc_id = "${docID}" AND uid = "${uid}";`, (err, result) => {
      if (result) {
        resolve(result);
      } else {
        reject(handleError(err));
      }
    });
  });
}

/**
 * Retrieves a list of documents by user ID (UID).
 *
 * @param uid - The unique identifier of the user whose documents are to be retrieved.
 * @returns A promise that resolves to an object containing the rows of the query result.
 *          Each row includes the document ID, title, creation time, and update time.
 * @throws Will reject the promise if an error occurs during the query execution.
 */
export function ListDocByUID(uid: string): Promise<{ rows: any }> {
  return new Promise((resolve, reject) => {
    executeQuery(`SELECT doc_id, title, create_time, update_time FROM docs WHERE
      uid = "${uid}";`, (err, result) => {
      if (result) {
        resolve(result);
      } else {
        reject(handleError(err));
      }
    });
  });
}

/**
 * Updates the title of a document identified by the given document ID and user ID.
 *
 * @param uid - The unique identifier of the user.
 * @param docID - The unique identifier of the document.
 * @param title - The new title to be set for the document.
 * @returns A promise that resolves with the result of the update operation.
 */
export function UpdateDocByUID(uid: string, docID: string, title: string):
  Promise<{ rows: OkPacket }> {
  return new Promise((resolve, reject) => {
    executeQuery(`UPDATE docs SET
      title = "${title}" WHERE
      doc_id = "${docID}" AND uid = "${uid}";`, (err, result) => {
      if (result) {
        resolve(result);
      } else {
        reject(handleError(err));
      }
    });
  });
}

/**
 * Deletes a document from the database by its user ID and document ID.
 *
 * @param uid - The unique identifier of the user.
 * @param docID - The unique identifier of the document.
 * @returns A promise that resolves with the result of the deletion operation.
 */
export function DeleteDocByUID(uid: string, docID: string): Promise<{ rows: OkPacket }> {
  return new Promise((resolve, reject) => {
    executeQuery(`DELETE FROM docs WHERE
      doc_id = "${docID}" AND uid = "${uid}";`, (err, result) => {
      if (result) {
        resolve(result);
      } else {
        reject(handleError(err));
      }
    });
  });
}
