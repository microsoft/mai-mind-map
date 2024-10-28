import { useCallback, useContext, useEffect, useState } from 'react';
import { MindMapState } from '../../../state/mindMapState';

export function useGenSubNodesWithAI() {
  const treeState = useContext(MindMapState);
  const [nodesGenerating, setNodesGenerating] = useState<Set<string>>(
    new Set<string>(),
  );

  const generateNodeWithAI = useCallback(
    (id: string, CurrentSection: string) => {
      setNodesGenerating((oldVal) => {
        const newVal = new Set(oldVal);
        newVal.add(id);
        return newVal;
      });
      const cp = treeState?.outputCP() || {};
      const data = {
        mindMapContent: JSON.stringify(cp),
        CurrentSection,
      };
      fetch('/api/genSubNodes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
        .then((r) => r.json())
        .then((json) => {
          if (json?.suggestions?.length) {
            console.log(json.suggestions);
            for (const suggestion of json.suggestions) {
              treeState?.addNode(id, 0, suggestion ?? '');
            }
          }
        })
        .finally(() => {
          setNodesGenerating((oldVal) => {
            const newVal = new Set(oldVal);
            newVal.delete(id);
            return newVal;
          });
        });
    },
    [treeState],
  );
  return {
    generateNodeWithAI,
    nodesGenerating,
  };
}
