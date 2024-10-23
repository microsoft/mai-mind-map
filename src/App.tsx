import './App.css';
import { useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAtom } from './base/atom';
import { filesAtom } from './biz/store';
import { FloatingTools } from './biz/floating';
import { Header } from './biz/head';
import { LayoutStyle } from './biz/layout';
import { SidePane } from './biz/side-pane';
import { viewModeAtom } from './biz/store';
import { LoadingVeiw } from './components/LoadingView';
import { MindMapView } from './components/mind-map/MapIndex';
import { useAutoColoringMindMap } from './components/mind-map/render/hooks/useAutoColoringMindMap';
import { OutlineView } from './components/outline';
import { MindMapState, useMindMapState } from './components/state/mindMapState';
import {
  useId,
  useToastController,
  Toaster,
  ToastTitle,
  Toast
} from "@fluentui/react-components";

const App = () => {
  const { fileId: id } = useParams();
  const { treeState, loadState } = useMindMapState(id || '');
  useAutoColoringMindMap(treeState);
  const [view] = useAtom(viewModeAtom);

  // for create new doc start
  const [, , { createDoc, refresh }] = useAtom(filesAtom);
  const navigate = useNavigate();
  const reactLocation = useLocation();
  const toasterId = useId("toaster");
  const { dispatchToast } = useToastController(toasterId);

  useEffect(() => {
    if (reactLocation.pathname === '/edit') {
      createDoc(navigate);
    }
    document.addEventListener('keydown', addGlobalEvent);

    return () => {
      document.removeEventListener('keydown', addGlobalEvent);
    }
  }, [createDoc, navigate, reactLocation]);
  // for create new doc end

  function addGlobalEvent(event: KeyboardEvent) {
    if (event.ctrlKey && event.key === 's') {
        event.preventDefault();
        treeState.saveDocument(() => {
          refresh();
          dispatchToast(
            <Toast>
              <ToastTitle>save success!</ToastTitle>
            </Toast>,
            { position: "top-end", intent: "success" }
          );
        });
    }
  }

  function renderContent() {
    if (loadState.type === 'loaded') {
      return (
        <>
          {view === 'mindmap' ? <MindMapView /> : <OutlineView />}
          <FloatingTools />
        </>
      );
    }
    return <LoadingVeiw />;
  }

  return (
    <MindMapState.Provider value={treeState}>
      <Toaster toasterId={toasterId} />
      <div className={LayoutStyle.Page}>
        <div className={LayoutStyle.Side}>
          <SidePane />
        </div>
        <div className={LayoutStyle.Main}>
          <div className={LayoutStyle.Head}>
            <Header treeState={treeState} />
          </div>
          <div className={LayoutStyle.Content}>{renderContent()}</div>
        </div>
      </div>
    </MindMapState.Provider>
  );
};

export default App;
