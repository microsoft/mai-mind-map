import express from 'express';
import {
  GetDocByID,
  GetDocList,
  NewDoc,
  UpdateDocByID,
} from '../storage/index';

let docs = express.Router();

docs.get('/list', async function (req, res) {
  const list = await GetDocList();
  res.send(list);
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
