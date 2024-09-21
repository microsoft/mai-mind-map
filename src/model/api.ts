import { MindMapCp } from './mind-map-model';
import { Timestamped } from './ot-doc/timestamped';
import {
  Read,
  readArray,
  readBoolean,
  readNumber,
  readPartial,
  readRecord,
  readString,
  readStruct,
} from './read';

const API_RESPONSE_TYPE_ERROR = 'API response type error';

const log = <T>(value: T) => {
  console.log(value);
  return value;
};

export const listDocuments = () =>
  fetch('/api/list')
    .then((res) => res.json())
    .then(
      readPartial({
        list: readArray(
          readStruct({
            title: readString,
            id: readString,
          }),
        ),
      }),
    )
    .then(({ list }) => list ?? []);

export const createDocument = () =>
  fetch('/api/new', { method: 'POST' })
    .then((res) => res.json())
    .then(readStruct({ id: readString }))
    .then((data) => {
      if (!data?.id) throw new Error(API_RESPONSE_TYPE_ERROR);
      return data.id;
    });

export const readTimestamped = <T>(
  read: Read<T>,
): Read<Timestamped<T> | undefined> =>
  readStruct({
    t: readNumber,
    v: read,
  });

export const getDocument = (id: string) =>
  fetch(`/api/get/${id}`)
    .then((res) => res.json())
    .then(
      readStruct({
        id: readString,
        content: readString,
      }),
    )
    .then((data) => {
      if (!data?.id) throw new Error(API_RESPONSE_TYPE_ERROR);
      return readRecord(
        readStruct({
          stringProps: readRecord(readTimestamped(readString)),
          numberProps: readRecord(readTimestamped(readNumber)),
          booleanProps: readRecord(readTimestamped(readBoolean)),
          children: readArray(readTimestamped(readString)),
        }),
      )(JSON.parse(data.content));
    });

export const updateDocument = (id: string, doc: MindMapCp) =>
  fetch(`/api/update/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(doc),
  })
    .then((res) => res.json())
    .then((data) => {
      if (!data?.id) throw new Error(API_RESPONSE_TYPE_ERROR);
      return data.id;
    });

export const deleteDocument = (id: string) =>
  fetch(`/api/delete/${id}`, { method: 'DELETE' })
    .then((res) => res.json())
    .then((data) => {
      if (!data?.id) throw new Error(API_RESPONSE_TYPE_ERROR);
      return data.id;
    });

(window as any).api = {
  listDocuments,
  createDocument,
  updateDocument,
  deleteDocument,
  getDocument,
};
