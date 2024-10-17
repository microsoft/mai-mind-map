import { atom } from '@root/base/atom';
import { FileInfo, deleteDocument } from '@root/model/api';


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
  function refresh() {
    set({ ...get(), loading: true });
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
