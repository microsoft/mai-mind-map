import express from 'express';
import {
  GetDocByID,
  GetDocList,
  handleError,
  NewDoc,
  SUCCESS,
  UpdateDocByID,
} from '../storage/index';

let docs = express.Router();

type ListItem = {
  doc_id: string,
  props: any,
};

docs.get('/list', async function (req, res) {
  const list = await GetDocList();
  if (list.msg !== SUCCESS || list.list === undefined) {
    res.send(list);
    return;
  }
  const docs: ListItem[] = [];
  try {
    for (const doc_id of list.list) {
      const doc = await GetDocByID(doc_id);
      if (doc.msg === SUCCESS && doc.content) {
        const doc_obj = JSON.parse(doc.content);
        if (doc_obj.hasOwnProperty('00000000')) {
          docs.push({
            doc_id,
            props: doc_obj['00000000'],
          });
        }
      }
    }
    res.send({ msg: SUCCESS, list: docs });
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
