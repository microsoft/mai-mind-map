import { atom } from '@root/base/atom';
import { FileInfo } from '@root/model/api';

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

  function update(id: string, data: Partial<FileInfo>) {
    const state = get();
    const files = state.files.map((f) => (f.id === id ? { ...f, ...data } : f));
    set({ ...state, files });
  }

  const actions = {
    refresh,
    update,
    fetchFilesOnce,
  };

  function fetchFilesOnce() {
    refresh();
    actions.fetchFilesOnce = () => {};
  }

  return actions;
});
