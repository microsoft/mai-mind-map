import express from 'express';
import { Gen } from '../ai';
import {
  DeleteDocByID,
  GetDocByID,
  GetDocList,
  NewDoc,
  UpdateDocByID,
} from '../storage/index';
import { ROOT_ID, handleError } from '../utils';

let docs = express.Router();

type ListItem = {
  id: string,
  created?: Date,
  updated: Date,
  title: string,
};

docs.get('/list', async function (req, res) {
  const list = await GetDocList();
  if (list.message || list.list === undefined) {
    res.send(list);
    return;
  }
  const docs: ListItem[] = [];
  try {
    for (const blob of list.list) {
      const doc = await GetDocByID(blob.name);
      if (!doc.message && doc.content) {
        const doc_obj = JSON.parse(doc.content);
        docs.push({
          id: blob.name,
          created: blob.createdOn ? blob.createdOn : blob.lastModified,
          updated: blob.lastModified,
          title: doc_obj && doc_obj[ROOT_ID] &&
            doc_obj[ROOT_ID].stringProps &&
            doc_obj[ROOT_ID].stringProps.content &&
            doc_obj[ROOT_ID].stringProps.content.v
            ? doc_obj[ROOT_ID].stringProps.content.v
            : undefined,
        });
      }
    }
    res.send({ list: docs });
  } catch (err: unknown) {
    res.send({ msg: handleError(err), list: docs });
  }
});

docs.post('/new', async function (req, res) {
  const result = await NewDoc();
  res.send(result);
});

docs.get('/get/:id', async function (req, res) {
  /**
   * Retrieves a document by its ID from the request parameters.
   *
   * @param req - The request object containing the document ID in the parameters.
   * @returns The document corresponding to the provided ID.
   */
  const result = await GetDocByID(req.params.id)
  res.send(result);
});

docs.patch('/update/:id', async function (req, res) {
  /**
   * Updates a document by its ID with the provided data from the request body.
   *
   * @param req - The request object containing the document ID in the
   * parameters and the update data in the body.
   * @param req.params.id - The ID of the document to be updated.
   * @param req.body - The data to update the document with.
   * @returns A promise that resolves to the result of the update operation.
   */
  const result = await UpdateDocByID(req.params.id, req.body);
  res.send(result);
});

docs.delete('/delete/:id', async function (req, res) {
  /**
   * Deletes a document by its ID.
   *
   * @param {Request} req - The request object containing the document ID in the parameters.
   * @param {Response} res - The response object to send the result of the deletion.
   * @returns {Promise<void>} - A promise that resolves when the document is deleted.
   */
  const result = await DeleteDocByID(req.params.id)
  res.send(result);
});

/**
 * Generate content in specified format by given content with AI services.
 */
docs.post('/gen', async function (req, res) {
  const result = await Gen(req.body);
  res.send(result);
});

module.exports = docs;
