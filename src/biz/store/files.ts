import { atom } from '@root/base/atom';
import { FileInfo, createDocument, deleteDocument } from '@root/model/api';
import { NavigateFunction } from 'react-router-dom';

const DefaultState = {
  loading: false,
  files: [] as FileInfo[],
};

export const filesAtom = atom(DefaultState, (get, set) => {
  function refresh() {
    set({ ...get(), loading: true });
    return fetch('/api/list')
      .then((r) => r.json())
      .then((r) => set({ files: r.list, loading: false }))
      .catch(() => set({ ...get(), loading: false }));
  }

  // Todo call server api to update
  function update(id: string, data: Partial<FileInfo>) {
    const state = get();
    const files = state.files.map((f) => (f.id === id ? { ...f, ...data } : f));
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
  async function fetchFilesOnce(navigate: NavigateFunction, id?: string) {
    if (fetched) return;
    fetched = true;
    await refresh();
    if (id) return;
    const { files } = get();
    if (files.length > 0) {
      const docId = await createDocument();
      refresh();
      navigate(`/edit/${docId}`);
    } else {
      navigate(`/edit/${files[0].id}`);
    }
  }

  return {
    refresh,
    update,
    fetchFilesOnce,
    remove,
  };
});
