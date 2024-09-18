import { Link, Outlet, useLocation } from 'react-router-dom';
import './App.css';
import { MindMap, MindMapList, Presenter } from './components/icons/icons';
import { STreeViewController } from './components/mind-map/Controller';
import {
  PresentationButton,
  mockFromSampleData,
} from './components/presentation';
import {
  TreeViewControllerPortal,
  useTreeViewControl,
} from './components/state/treeViewState';

const App = () => {
  const { treeViewControlRef, portal } = useTreeViewControl();

  const location = useLocation();
  return (
    <TreeViewControllerPortal.Provider value={portal}>
      <div className="control-panel">
        <ul className="layout-sl">
          <li className={location.pathname == '/mindmap' ? 'active' : ''}>
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
              rootNode={mockFromSampleData}
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
  );
};

export default App;
