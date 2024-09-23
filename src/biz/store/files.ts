import { atom } from '@root/base/atom';
import { FileInfo, deleteDocument } from '@root/model/api';

const DefaultState = {
  loading: false,
  files: [] as FileInfo[],
};

export const filesAtom = atom(DefaultState, (get, set) => {
  function refresh() {
    set({ ...get(), loading: true });
    fetch('/api/list')
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

  const actions = {
    refresh,
    update,
    fetchFilesOnce,
    remove,
  };

  function fetchFilesOnce() {
    refresh();
    actions.fetchFilesOnce = () => {};
  }

  return actions;
});
