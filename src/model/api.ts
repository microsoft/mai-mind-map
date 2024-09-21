import { MindMapCp } from "./mind-map-model";
import { Timestamped } from "./ot-doc/timestamped";
import { Read, readArray, readBoolean, readNumber, readRecord, readString, readStruct } from "./read";

const API_RESPONSE_TYPE_ERROR = "API response type error";

export const listDocuments = () =>
  fetch("/api/list")
    .then((res) => res.json())
    .then(
      readArray(
        readStruct({
          title: readString,
          id: readString,
        })
      )
    );

export const createDocument = () =>
  fetch("/api/new", { method: "POST" })
    .then((res) => res.json())
    .then(readStruct({ id: readString }))
    .then(data => {
      if (data?.id) {
        return data.id;
      }
      throw new Error(API_RESPONSE_TYPE_ERROR);
    });

export const readTimestamped = <T>(
  read: Read<T>
): Read<Timestamped<T> | undefined> =>
  readStruct({
    t: readNumber,
    v: read,
  });

export const getDocument = (id: string) =>
  fetch(`/api/get/${id}`)
    .then((res) => res.json())
    .then(readStruct({
      id: readString,
      content: readString,
    }))
    .then(data => {
      if (!data?.id) throw new Error(API_RESPONSE_TYPE_ERROR);
      return readRecord(readStruct({
        stringProps: readRecord(readTimestamped(readString)),
        numberProps: readRecord(readTimestamped(readNumber)),
        booleanProps: readRecord(readTimestamped(readBoolean)),
        children: readArray(readTimestamped(readString)),
      }))(JSON.parse(data.content));
    });

export const updateDocument = (id: string, doc: MindMapCp) =>
  fetch(`api/update/${id}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(doc),
  });
