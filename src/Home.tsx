import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAtom } from "./base/atom";
import { css } from "./base/styled";
import icons from "./biz/components/icons";
import { filesAtom } from "./biz/store";
import { LoadingVeiw } from "./components/LoadingView";

const SPage = css`
  display: flex;
  height: 100%;
  width: 100%;
  justify-content: center;
  align-items: center;
`;

const SBox = css`
  max-width: 800px;
  min-width: 600px;
  padding: 16px;
  background-color: white;
  border-radius: 6px;
  border: 1px solid rgba(0, 0, 0, 0.05);
  box-shadow: rgba(0, 16, 32, 0.2) 0px 0px 1px 0px, rgba(0, 16, 32, 0.12) 0px 4px 24px 0px;
`;

const SHead = css`
  margin-bottom: 20px;
  &>h1, &>h2 {
    all: unset;
    display: block;
    text-align: center;
  }
  &>h1 {
    font-size: 24px;
    margin-bottom: 8px;
  }
  &>h2 {
    font-size: 16px;
    color: #666;
  }
`;
const SEmpty = css`
  padding: 2px 0 9px;
  button {
    all: unset;
    box-sizing: border-box;
    display: block;
    width: 100%;
    padding: 8px;
    text-align: center;
    background-color: #0078d4;
    color: white;
    border-radius: 4px;
    cursor: pointer;
    &:hover {
      background-color: #005a9e;
    }
  }
`;
const SFiles = css`
  display: grid;
  grid-template-columns: repeat(auto-fill, 120px);
  grid-gap: 12px;
  justify-content: space-around;
`;
const SFile = css`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px;
  cursor: pointer;
  font-size: 14px;
  border: 1px solid #e9e9e9;
  border-radius: 4px;
  &:hover {
    background-color: rgba(0,0,0,0.04);
  }
  .file-icon {
    flex: 0 0 auto;
    width: 16px;
    display: flex;
    align-items: center;
  }
  .file-title {
    flex: 1 1 auto;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

function LoadingContent() {
  return (
    <>
      <div className={SHead}>
        <h1>Welcome to Ms Mind Map</h1>
        <h2>Loading files ...</h2>
      </div>
      <LoadingVeiw />
    </>
  );
}

function EmptyContent() {
  const navigate = useNavigate();
  return (
    <>
      <div className={SHead}>
        <h1>Welcome to Ms Mind Map</h1>
      </div>
      <div className={SEmpty}>
        <button onClick={() => navigate('/edit')}>
          Create your first mind map
        </button>
      </div>
    </>
  );
}

function Home() {
  const [{ files, loading }, ,actions] = useAtom(filesAtom);
  useEffect(actions.fetchFilesOnce, []);
  const navigate = useNavigate();

  let content: React.ReactNode;
  if (loading) {
    content = <LoadingContent />;
  } else if (files.length === 0) {
    content = <EmptyContent />;
  } else {
    content = (
      <>
        <div className={SHead}>
          <h1>Welcome to Ms Mind Map</h1>
          <h2>Choose one file to view</h2>
        </div>
        <div className={SFiles}>
          {files.map((d) => {
            const open = () => navigate(`/edit/${d.id}`);
            return (
              <div key={d.id} className={SFile} onClick={open}>
                <div className="file-icon">{icons.mindmap}</div>
                <div className="file-title">{d.title || 'Untitled'}</div>
              </div>
            );
          })}
        </div>
      </>
    );
  }

  return (
    <div className={SPage}>
      <div className={SBox}>{content}</div>
    </div>
  );
}

export default Home;
