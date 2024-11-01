import { useEffect, useContext } from 'react';
import { MindMapState } from '../../../state/mindMapState';
import { EditingNodeType } from '../../EditingNode';
import { Payload } from '../model/interface';
import {
  NodeInterface,
  SizedRawNode,
} from '../../render';

export function useKeyboardNavigate(
  root: NodeInterface<SizedRawNode<Payload>> | null,
  editingNode: EditingNodeType<Payload> | null,
  setPendingEditNode: Function
) {  
  const treeState = useContext(MindMapState);
  const positionCenter = root?.x || 0;

  const navigateToParent = () => {
    if(editingNode && editingNode.node.parent) {
      setPendingEditNode({
        node: editingNode.node.parent,
        translate: [editingNode.node.parent.x, editingNode.node.parent.y]
      });
    }
  }

  const navigateToChild = () => {
    if(editingNode) {
      const node = editingNode.node.children[0];
      if(node) {
        setPendingEditNode({
          node,
          translate: [node.x, node.y]
        });
      }
    }
  }
 
  useEffect(() => {
    const handleKeydown = (event: KeyboardEvent) => {
      if (!editingNode) return;

      switch(event.key) {
        case 'Tab':
          event.preventDefault();
          treeState?.addNode(editingNode.node.id, editingNode.node.children.length ?? 0, 'new node');
          break;
        case 'Delete':
          event.preventDefault();
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
          event.preventDefault();
          if(editingNode.node.id === root!.id) {
            const node = root?.children.find(el => el.x < positionCenter);
            setPendingEditNode({
              node,
              translate: [node!.x, node!.y]
            });
          } else {
            editingNode.node.x > positionCenter ? navigateToParent() : navigateToChild();
          }
          break;
        case 'ArrowRight':
          event.preventDefault();
          if(editingNode.node.id === root!.id) {
            const node = root?.children.find(el => el.x > positionCenter);
            setPendingEditNode({
              node,
              translate: [node!.x, node!.y]
            });
          } else {
            editingNode.node.x > positionCenter ? navigateToChild() : navigateToParent();
          }
          break;
        case 'ArrowUp':
        case 'ArrowDown':
          event.preventDefault();
          let currentIndex = editingNode.node.parent?.children.findIndex(el => el.id === editingNode.node.id);
          const len = editingNode.node.parent?.children.length || 0;
          if(currentIndex !== undefined) {
            if(currentIndex >= 0 && currentIndex <= len) {
              const node = editingNode.node.parent?.children[event.key === 'ArrowUp' ? currentIndex - 1 : currentIndex + 1];
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
