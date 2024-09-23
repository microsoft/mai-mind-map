import { css } from "@root/base/styled";
import { MindMapState } from "@root/components/state/mindMapState";
import { useContext, useState } from "react";
import Markdown from "react-markdown";
import { BeatLoader } from "react-spinners";
import icons from "../components/icons";
import Modal from "../components/modal";

const SHead = css`
  min-width: 600px;
  padding: 8px 12px;
  border-bottom: 1px solid #dddddd;
  h1 {
    all: unset;
    font-size: 24px;
    font-weight: 500;
  }
`;
const SBody = css`
  padding: 0 12px;
  max-height: 400px;
  overflow-y: auto;
`;
const SFoot = css`
  padding: 8px 12px;
  border-top: 1px solid #dddddd;
  display: flex;
  align-items: center;
  justify-content: space-between;

  &>button {
    padding: 10px 16px;
    border: 1px solid #ccc;
    border-radius: 4px;
    background-color: transparent;
    cursor: pointer;
    &:hover {
      border-color: #2370ff;
      background-color: #2370ff;
      color: white;
    }
  }
`;
const SLoading = css`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 300px;
  height: 80px;
`;

function gen(title: string, content: string) {
  const data = { from: 'mind', to: 'markdown', title, content };
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  };
  return fetch('/api/gen', options)
    .then(r => r.json())
    .then(r => r.content as string);
}

const DemoLoop = 'https://microsoftapc.sharepoint.com/:fl:/g/contentstorage/x8FNO-xtskuCRX2_fMTHLcdu6xYIDP9BreaCKHRzNfQ/Ecoi3r6M-OdKhpi3OEjFjckB_36vEoPtnVBoUIhAWjKE3w?e=BoA8io&nav=cz0lMkZjb250ZW50c3RvcmFnZSUyRng4Rk5PLXh0c2t1Q1JYMl9mTVRITGNkdTZ4WUlEUDlCcmVhQ0tIUnpOZlEmZD1iJTIxWE9Rc0xHZnhsRXE1SEJZX29fTXZWZFZoQTV5Y2w4ZENvd1JRdFZOZWhxenIwM3dhZDZRWVQ1Y0lmSWZ2b1F4YiZmPTAxWDIyNVNMR0tFTFBMNURIWTQ1RklOR0ZYSEJFTUxET0omYz0lMkYmcD0lNDBmbHVpZHglMkZsb29wLXBhZ2UtY29udGFpbmVy&xsdata=MDV8MDJ8fDQwYWZkYjM1YTJhODQzODg5ZTE5MDhkY2RiYWE0MGRhfDcyZjk4OGJmODZmMTQxYWY5MWFiMmQ3Y2QwMTFkYjQ3fDB8MHw2Mzg2MjY3NzE0NTg3NjAyMTd8VW5rbm93bnxWR1ZoYlhOVFpXTjFjbWwwZVZObGNuWnBZMlY4ZXlKV0lqb2lNQzR3TGpBd01EQWlMQ0pRSWpvaVYybHVNeklpTENKQlRpSTZJazkwYUdWeUlpd2lWMVFpT2pFeGZRPT18MXxMMk5vWVhSekx6RTVPbUk0WVdZeU1qYzBZell4TWpRMFltTmlOekprWWpSa09UQTNPV1ppTW1ZeVFIUm9jbVZoWkM1Mk1pOXRaWE56WVdkbGN5OHhOekkzTURnd016UTFNRFV5fDM5MzA4YjA0OTQ3ZjQ2NjU5ZTE5MDhkY2RiYWE0MGRhfDk4YmFlNTY0MTAwNDQ2M2VhYzA5YTFiYWNmNWUzYWUz&sdata=TXlCbDVZMEVQeTNmTlhXWUF1Qm94YkQxcTZVMDlKOXdOa0lvbWRhckt1Zz0%3D&ovuser=72f988bf-86f1-41af-91ab-2d7cd011db47%2Cxuri%40microsoft.com'

export function Generate(props: {
  className?: string;
}) {
  const { className } = props;
  const [result, setRes] = useState('');
  const [loading, setLoading] = useState(false);
  const state = useContext(MindMapState);

  function handle() {
    const cp = state?.outputCP() || {};
    setLoading(true);
    gen('Test', JSON.stringify(cp))
      .then(setRes)
      .finally(() => setLoading(false));
  }

  let preview: React.ReactNode;
  if (loading) {
    preview = (
      <Modal>
        <div className={SLoading}>
          <div>Waiting for Generating...</div>
          <BeatLoader />
        </div>
      </Modal>
    );
  } else if (result) {
    preview = (
      <Modal hide={() => setRes('')}>
        <div className={SHead}>
          <h1>Preview</h1>
        </div>
        <div className={SBody}>
          <Markdown>{result}</Markdown>
        </div>
        <div className={SFoot}>
          <div>
            Generate a loop file and edit it in a new page
          </div>
          <button onClick={() => window.open(DemoLoop, '_blank')}>
            Edit in page
          </button>
        </div>
      </Modal>
    );
  }

  return (
    <div className={className} onClick={handle}>
      <span style={{ width: 12, display: 'flex', alignItems: 'center' }}>
        {icons.makeFile}
      </span>
      <span>Generate</span>
      {preview}
    </div>
  );
}
