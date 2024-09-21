import { readArray, readString, readStruct } from "./read";

export type ListItem = {
  title: string;
  id: string;
};

const readListItems = readArray<ListItem>(readStruct({
  title: readString,
  id: readString,
}));

export const listDocuments = () =>
  fetch("/api/list")
    .then((res) => res.json())
    .then(readListItems);
