import { useMemo } from 'react';
import './App.css';
import { useAtom } from './base/atom';
import { FloatingTools } from './biz/floating';
import { Header } from './biz/head';
import { LayoutStyle } from './biz/layout';
import { SidePane } from './biz/side-pane';
import { viewModeAtom } from './biz/store';
import { MindMapView } from './components/mind-map/MapIndex';
import { OutlineView } from './components/outline';
import {
  MindMapState,
  useMindMapState,
} from './components/state/mindMapState';
import { useLocation } from 'react-router-dom';

const App = () => {
  const location = useLocation();
  const id = useMemo(() => {
    const m = (location.pathname).match(/edit\/([0-9a-z\-]+)/);
    return m?.[1] ?? "";
  }, [location]);
  const treeState = useMindMapState(id);
  const [view] = useAtom(viewModeAtom);

  return (
    <MindMapState.Provider value={treeState}>
      <div className={LayoutStyle.Page}>
        <div className={LayoutStyle.Side}>
          <SidePane />
        </div>
        <div className={LayoutStyle.Main}>
          <div className={LayoutStyle.Head}>
            <Header treeState={treeState} />
          </div>
          <div className={LayoutStyle.Content}>
            {view === 'mindmap' ? <MindMapView /> : <OutlineView />}
            <FloatingTools />
          </div>
        </div>
      </div>
    </MindMapState.Provider>
  );
};

export default App;
