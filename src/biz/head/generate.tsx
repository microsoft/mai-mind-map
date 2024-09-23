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

const DemoLoop = 'https://loop.cloud.microsoft/p/eyJ3Ijp7InUiOiJodHRwczovL21pY3Jvc29mdC5zaGFyZXBvaW50LmNvbS8%2FbmF2PWN6MGxNa1ltWkQxaUlYTTRYM3BJT0Znd1RtdFhUVzlaTTBkTFpHOTVibVZ6YWpoMk0xaHZUVUpRYUUxTU0zTkdUbmRTUnpVMWJIcEdVVE15U0RaUmNURXhkR3hCWHkxb1kzUW1aajB3TVU1SE5WaFhWbFpUTlZKYVdsVTJVbFJYV2tKSk5rSkJOVUZZVUZjeVZVUmFKbU05Sm1ac2RXbGtQVEUlM0QiLCJyIjpmYWxzZX0sInAiOnsidSI6Imh0dHBzOi8vbWljcm9zb2Z0LnNoYXJlcG9pbnQuY29tLzpmbDovci9zaXRlcy84ODVjZThmNy1mMDQ4LTQwZWQtYWIwYS05ZDUzYWI1NTIxYTgvU2hhcmVkJTIwRG9jdW1lbnRzL0xvb3BBcHBEYXRhL1VudGl0bGVkJTIwMS5sb29wP2Q9dzIxNWM4NmNiODM4MTQ1MmNhMDdhNmMzOTlhZTVlYTE3JmNzZj0xJndlYj0xJm5hdj1jejBsTWtaemFYUmxjeVV5UmpnNE5XTmxPR1kzTFdZd05EZ3ROREJsWkMxaFlqQmhMVGxrTlROaFlqVTFNakZoT0Naa1BXSWhjemhmZWtnNFdEQk9hMWROYjFrelIwdGtiM2x1WlhOcU9IWXpXRzlOUWxCb1RVd3pjMFpPZDFKSE5UVnNla1pSTXpKSU5sRnhNVEYwYkVGZkxXaGpkQ1ptUFRBeFRrYzFXRmRXVjB4UldrOURSRUZOUkVaU1F6SkJObFJOU0VkT1Qwd3lVVmdtWXowbE1rWW1abXgxYVdROU1TWmhQVXh2YjNCQmNIQW1jRDBsTkRCbWJIVnBaSGdsTWtac2IyOXdMWEJoWjJVdFkyOXVkR0ZwYm1WeUpuZzlKVGRDSlRJeWR5VXlNaVV6UVNVeU1sUXdVbFJWU0hoMFlWZE9lV0l6VG5aYWJsRjFZekpvYUdOdFZuZGlNbXgxWkVNMWFtSXlNVGhaYVVaNlQwWTVObE5FYUZsTlJUVnlWakF4ZGxkVVRraFRNbEoyWlZjMWJHTXlielJrYWs1WllqQXhRMVZIYUU1VVJFNTZVbXMxTTFWcll6Rk9WM2cyVW14RmVrMXJaekpWV0VWNFRWaFNjMUZXT0hSaFIwNHdaa1JCZUZScll6RlhSbVJYVm14Tk1WVnNjR0ZXVkZwVFZrWmtZVkZyYXpKUmEwVXhVVlpvVVZaNlNsWlNSbThsTTBRbE1qSWxNa01sTWpKcEpUSXlKVE5CSlRJeVlqUTRPVEppTlRNdFl6TTFOeTAwTXpneUxXSTRZV1l0TW1aa01HSm1OVFF3TXpnMkpUSXlKVGRFIiwiciI6ZmFsc2V9LCJpIjp7ImkiOiJiNDg5MmI1My1jMzU3LTQzODItYjhhZi0yZmQwYmY1NDAzODYifX0%3D'

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
