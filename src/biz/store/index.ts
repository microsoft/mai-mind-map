import { atom } from '@root/base/atom';

export { filesAtom } from './files';

export const showSidepaneAtom = atom(true);

const search = new URLSearchParams(location.search);
const DefaultView: 'outline' | 'mindmap' =
  search.get('view') === 'outline' ? 'outline' : 'mindmap';
export const viewModeAtom = atom(DefaultView, (get, set) => {
  function updateURL(view: string) {
    const url = new URL(location.href);
    url.searchParams.set('view', view);
    history.pushState(null, '', url);
  }

  function showMindmap() {
    set('mindmap');
    updateURL('mindmap');
  }

  function showOutline() {
    set('outline');
    updateURL('outline');
  }
  return { showMindmap, showOutline };
});
