import { Link, Outlet, useLocation } from 'react-router-dom';
import './App.css';
import { MindMap, MindMapList, Presenter } from './components/icons/icons';
import { STreeViewController } from './components/mind-map/Controller';
import {
  PresentationButton,
  presentationNodeFromSampleData,
} from './components/presentation';
import {
  MindMapState,
  TreeViewControllerPortal,
  useMindMapState,
  useTreeViewControl,
} from './components/state/mindMapState';

const App = () => {
  const { treeViewControlRef, portal } = useTreeViewControl();
  const treeState = useMindMapState();

  const location = useLocation();
  return (
    <MindMapState.Provider value={treeState}>
      <TreeViewControllerPortal.Provider value={portal}>
        <div className="control-panel">
          <ul className="layout-sl">
            <li
              className={
                location.pathname == '/mindmap' || location.pathname == '/'
                  ? 'active'
                  : ''
              }
            >
              <Link to="mindmap">
                <MindMap />
                &nbsp;MindMap
              </Link>
            </li>
            <li className={location.pathname == '/outline' ? 'active' : ''}>
              <Link to="outline">
                <MindMapList />
                &nbsp;Outline
              </Link>
            </li>
            <li>
              <PresentationButton
                rootNode={presentationNodeFromSampleData(treeState.mindMapData)}
                style={{
                  padding: 10,
                  display: 'flex',
                }}
              >
                <Presenter />
                &nbsp;Presenter
              </PresentationButton>
            </li>
          </ul>
          <div ref={treeViewControlRef} className={STreeViewController}></div>
        </div>
        <Outlet />
      </TreeViewControllerPortal.Provider>
    </MindMapState.Provider>
  );
};

export default App;
