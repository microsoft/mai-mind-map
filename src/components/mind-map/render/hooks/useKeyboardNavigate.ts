import { useEffect, useContext } from 'react';
import { MindMapState } from '../../../state/mindMapState';
import { EditingNodeType } from '../../EditingNode';
import { Payload } from '../model/interface';

export function useKeyboardNavigate(
  editingNode: EditingNodeType<Payload> | null,
  setPendingEditNode: Function
) {  
  const treeState = useContext(MindMapState);

  useEffect(() => {
    const handleKeydown = (event: KeyboardEvent) => {
      if (!editingNode) return;
      event.preventDefault();
      console.log('event', event);

      switch(event.key) {
        case 'Tab':
          treeState?.addNode(editingNode.node.id, editingNode.node.children.length ?? 0, 'new node');
          break;
        case 'Delete':
          treeState?.delNode(editingNode.node.id);
          setPendingEditNode(null);
          break;
        case 'ArrowLeft':
        case 'ArrowRight':
        case 'ArrowUp':
        case 'ArrowDown':
            break;
        default:
          break;
      }
    };

    const controller = new AbortController();
    const signal = controller.signal;

    document.addEventListener('keydown', handleKeydown, { signal, capture: true });

    return () => {
      controller.abort();
    };
  }, [editingNode]);

  return { editingNode };
}
