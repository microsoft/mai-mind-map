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
      console.log(treeState);

      switch(event.key) {
        case 'Tab':
          treeState?.addNode(editingNode.node.id, editingNode.node.children.length ?? 0, 'new node');
          break;
        case 'Delete':
          treeState?.delNode(editingNode.node.id);
          if(editingNode.node.parent) {
            setPendingEditNode({
              node: editingNode.node.parent,
              translate: [editingNode.node.parent.x, editingNode.node.parent.y]
            });
          } else {
            setPendingEditNode(null);
          }
          break;
        case 'ArrowLeft':
          break;
        case 'ArrowRight':
          break;
        case 'ArrowUp':
        case 'ArrowDown':
          let currentIndex = editingNode.node.parent?.children.findIndex(el => el.id === editingNode.node.id);
          const len = editingNode.node.parent?.children.length || 0;
          if(currentIndex !== undefined) {
            if(currentIndex >= 0 && currentIndex <= len) {
              const node = editingNode.node.parent?.children[event.key === 'ArrowUp' ? currentIndex - 1 : currentIndex + 1];
              console.log(node);
              if(node) {
                setPendingEditNode({
                  node,
                  translate: [node.x, node.y]
                });
              }
            }
          }
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
