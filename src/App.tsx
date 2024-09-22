import { Link, Outlet, useLocation } from 'react-router-dom';
import './App.css';
import { Header } from './biz/head';
import { LayoutStyle } from './biz/layout';
import { SidePane } from './biz/side-pane';
import { MindMap, MindMapList } from './components/icons/icons';
import { STreeViewController } from './components/mind-map/Controllers/Controller';
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
        <div className={LayoutStyle.Page}>
          <div className={LayoutStyle.Side}>
            <SidePane />
          </div>
          <div className={LayoutStyle.Main}>
            <div className={LayoutStyle.Head}>
              <Header treeState={treeState} />
            </div>
            <div className={LayoutStyle.Content}>
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
                </ul>
                <div ref={treeViewControlRef} className={STreeViewController}></div>
              </div>
              <Outlet />
            </div>
          </div>
        </div>
      </TreeViewControllerPortal.Provider>
    </MindMapState.Provider>
  );
};

export default App;
