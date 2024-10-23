import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { Gen } from '../ai';
import {
  AddDoc,
  DeleteDocByUID,
  GetDocByUID,
  ListDocByUID,
  UpdateDocByUID
} from '../storage/docs';
import {
  DeleteDocByID,
  GetDocByID,
  NewDoc,
  UpdateDocByID,
} from '../storage/index';
import { getUID } from '../storage/users';
import { PERMISSION_DENIED, getDocTitle, handleError } from '../utils';

export const docsRouter = express.Router();

type ListItem = {
  id: string,
  created?: Date,
  updated: Date,
  title?: string,
};

docsRouter.get('/list', async function (req, res) {
  const docs: ListItem[] = [];
  try {
    const uid = await getUID(req);
    if (uid === undefined) {
      res.status(401).send({ list: docs, message: PERMISSION_DENIED });
      return;
    }
    const result = await (ListDocByUID(uid));
    for (const row of result.rows) {
      docs.push({
        id: row.doc_id,
        created: row.create_time,
        updated: row.update_time,
        title: row.title === null ? undefined : row.title,
      });
    }
    res.send({ list: docs });
  } catch (err: unknown) {
    res.status(500).send({ message: handleError(err), list: docs });
    return;
  }
});

docsRouter.post('/new', async function (req, res) {
  const docID = uuidv4();
  try {
    const uid = await getUID(req);
    if (uid === undefined) {
      res.status(401).send({ message: PERMISSION_DENIED });
      return;
    }
    const user = await (AddDoc(uid, docID, "New Mind Map"));
    if (user.rows.affectedRows != 1) {
      throw new Error(user.rows.message);
    }
  } catch (err: unknown) {
    res.status(500).send({ message: handleError(err) });
    return;
  }
  const result = await NewDoc(docID);
  res.send(result);
});

docsRouter.get('/get/:id', async function (req, res) {
  /**
   * Retrieves a document by its ID from the request parameters.
   *
   * @param req - The request object containing the document ID in the parameters.
   * @returns The document corresponding to the provided ID.
   */
  const docID = req.params.id;
  try {
    const uid = await getUID(req);
    if (uid === undefined) {
      res.status(401).send({ id: docID, message: PERMISSION_DENIED });
      return;
    }
    const result = await (GetDocByUID(uid, docID));
    if (result.rows.length === 0) {
      res.send({ id: docID, message: 'Doc not found' });
      return;
    }
  } catch (err: unknown) {
    res.status(500).send({ id: docID, message: handleError(err) });
    return;
  }
  const result = await GetDocByID(docID);
  res.send(result);
});

docsRouter.patch('/update/:id', async function (req, res) {
  /**
   * Updates a document by its ID with the provided data from the request body.
   *
   * @param req - The request object containing the document ID in the
   * parameters and the update data in the body.
   * @param req.params.id - The ID of the document to be updated.
   * @param req.body - The data to update the document with.
   * @returns A promise that resolves to the result of the update operation.
   */
  const docID = req.params.id;
  try {
    const uid = await getUID(req);
    if (uid === undefined) {
      res.status(401).send({ id: docID, message: PERMISSION_DENIED });
      return;
    }
    const result = await UpdateDocByID(docID, req.body);
    res.send(result);
  } catch (err: unknown) {
    res.status(500).send({ id: docID, message: handleError(err) });
    return;
  }
  
});

docsRouter.patch('/update/:id/docName', async function (req, res) {
  /**
   * Updates a document by its ID with the provided data from the request body.
   *
   * @param req - The request object containing the document ID in the
   * parameters and the update data in the body.
   * @param req.params.id - The ID of the document to be updated.
   * @param req.body - The data to update the document with.
   * @returns A promise that resolves to the result of the update operation.
   */
  const docID = req.params.id;
  try {
    const uid = await getUID(req);
    if (uid === undefined) {
      res.status(401).send({ id: docID, message: PERMISSION_DENIED });
      return;
    }
    const docName = req.body.docName;
    if (docName) {
      const result = await (UpdateDocByUID(uid, docID, docName));
      if (result.rows.affectedRows === 0) {
        res.send({ id: docID, result: 'failed', message: 'Doc not found' });
        return;
      }
    }
    res.send({id: docID, result: 'success'});
  } catch (err: unknown) {
    res.status(500).send({ id: docID, message: handleError(err) });
    return;
  }
});

docsRouter.delete('/delete/:id', async function (req, res) {
  /**
   * Deletes a document by its ID.
   *
   * @param {Request} req - The request object containing the document ID in the parameters.
   * @param {Response} res - The response object to send the result of the deletion.
   * @returns {Promise<void>} - A promise that resolves when the document is deleted.
   */
  const docID = req.params.id;
  try {
    const uid = await getUID(req);
    if (uid === undefined) {
      res.status(401).send({ id: docID, message: 'Permission denied' });
      return;
    }
    const result = await (DeleteDocByUID(uid, docID));
    if (result.rows.affectedRows != 1) {
      throw new Error(result.rows.message);
    }
  } catch (err: unknown) {
    res.status(500).send({ id: docID, message: handleError(err) });
    return;
  }
  const result = await DeleteDocByID(docID)
  res.send(result);
});

/**
 * Generate content in specified format by given content with AI services.
 */
docsRouter.post('/gen', async function (req, res) {
  const docID = uuidv4();
  try {
    const uid = await getUID(req);
    if (uid === undefined) {
      res.status(401).send({ message: PERMISSION_DENIED });
      return;
    }
    const user = await (AddDoc(uid, docID, req.body.title ?? ''));
    if (user.rows.affectedRows != 1) {
      throw new Error(user.rows.message);
    }
  } catch (err: unknown) {
    res.status(500).send({ message: handleError(err) });
    return;
  }
  const result = await Gen(docID, req.body);
  res.send(result);
});
