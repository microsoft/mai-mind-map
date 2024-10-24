import './App.css';
import { useParams } from 'react-router-dom';
import { useAtom } from './base/atom';
import { FloatingTools } from './biz/floating';
import { Header } from './biz/head';
import { LayoutStyle } from './biz/layout';
import { SidePane } from './biz/side-pane';
import { viewModeAtom } from './biz/store';
import { LoadingVeiw } from './components/LoadingView';
import { MindMapView } from './components/mind-map/MapIndex';
import { useAutoColoringMindMap } from './components/mind-map/render/hooks/useAutoColoringMindMap';
import { OutlineView } from './components/outline';
import {
  MindMapState,
  useMindMapState,
} from './components/state/mindMapState';

const App = () => {
  const { fileId: id } = useParams();
  const { treeState, loadState } = useMindMapState(id || '');
  useAutoColoringMindMap(treeState);
  const [view] = useAtom(viewModeAtom);

  function renderContent() {
    if (loadState.type === 'loaded') {
      return <>
        {view === 'mindmap' ? <MindMapView /> : <OutlineView />}
        <FloatingTools />
      </>;
    }
    return <LoadingVeiw />;
  }

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
            {renderContent()}
          </div>
        </div>
      </div>
    </MindMapState.Provider>
  );
};

export default App;
