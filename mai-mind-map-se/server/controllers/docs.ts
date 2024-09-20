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
  doc_id: string,
  v: any,
};

docs.get('/list', async function (req, res) {
  const list = await GetDocList();
  if (list.msg || list.list === undefined) {
    res.send(list);
    return;
  }
  const docs: ListItem[] = [];
  try {
    for (const doc_id of list.list) {
      const doc = await GetDocByID(doc_id);
      if (!doc.msg && doc.content) {
        const doc_obj = JSON.parse(doc.content);
        if (doc_obj.hasOwnProperty('00000000') &&
          doc_obj['00000000'].hasOwnProperty('stringProps') &&
          doc_obj['00000000']['stringProps'].hasOwnProperty('content') &&
          doc_obj['00000000']['stringProps']['content'].hasOwnProperty('v')) {
          docs.push({
            doc_id,
            v: doc_obj['00000000']['stringProps']['content']['v'],
          });
        }
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
