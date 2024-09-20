import express from 'express';
import {
  GetDocByID,
  GetDocList,
  handleError,
  NewDoc,
  UpdateDocByID,
} from '../storage/index';

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
          title: doc_obj && doc_obj['00000000'] &&
            doc_obj['00000000'].stringProps &&
            doc_obj['00000000'].stringProps.content &&
            doc_obj['00000000'].stringProps.content.v
            ? doc_obj['00000000'].stringProps.content.v
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
  const result = await GetDocByID(req.params.id)
  res.send(result);
});

docs.patch('/update/:id', async function (req, res) {
  const result = await UpdateDocByID(req.params.id, req.body);
  res.send(result);
});

module.exports = docs;
