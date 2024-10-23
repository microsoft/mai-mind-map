import { atom } from '@root/base/atom';
import {
  FileInfo,
  createDocument,
  deleteDocument,
  updateDocumentName,
} from '@root/model/api';
import { NavigateFunction } from 'react-router-dom';

interface State {
  loading: boolean;
  login: boolean | undefined;
  files: FileInfo[];
}

const DefaultState: State = {
  loading: false,
  login: undefined,
  files: [] as FileInfo[],
};

export const filesAtom = atom(DefaultState, (get, set) => {
  function refresh(loading = true) {
    set({ ...get(), loading });
    fetch('/api/list')
      .then((r) => {
        if (r.status === 401) {
          set({ ...get(), loading: false, login: false });
          return;
        }
        return r.json();
      })
      .then((r) => {
        if (r) {
          set({ files: r.list, loading: false, login: true });
        }
      })
      .catch((e) => {
        console.error(e);
        set({ ...get(), loading: false });
      });
  }

  function update(id: string, data: Partial<FileInfo>) {
    const state = get();
    const files = state.files.map((f) => {
      if (f.id === id && data.title) {
        if (data.title !== f.title) {
          updateDocumentName(id, data.title || '').then(() => {
            refresh(/*loading=*/ false);
          });
        }
        return { ...f, ...data };
      } else {
        return f;
      }
    });
    set({ ...state, files });
  }

  function remove(id: string) {
    return deleteDocument(id).then(() => {
      const state = get();
      const files = state.files.filter((f) => f.id !== id);
      set({ ...state, files });
      return files[0];
    });
  }

  let fetched = false;
  async function fetchFilesOnce() {
    if (fetched) return;
    fetched = true;
    await refresh();
  }
  async function createDoc(navigate: NavigateFunction) {
    const id = await createDocument();
    navigate(`/edit/${id}`);
    setTimeout(() => {
      refresh(/*loading=*/ false);
    }, 500);
  }

  return {
    refresh,
    update,
    fetchFilesOnce,
    createDoc,
    remove,
  };
});
