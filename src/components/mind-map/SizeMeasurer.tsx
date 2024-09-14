import { css } from '@base/styled';
import { useLayoutEffect, useMemo, useRef } from 'react';
import { NodeContent } from './NodeContent';
import { RawNode, SizedRawNode, prepareNodeSize } from './render';
import { expandTreeToArray } from './render/model';
import { Payload } from './render/model/interface';

const sizeMeasurerClass = css`
  position: absolute;
  z-index: -1000;
  left: 0;
  top: 0px;
  visibility: hidden;
  pointer-events: none;
  height: 20px;
  overflow: hidden;
`;

const idPrefix = 'mnc';

export function SizeMeasurer<D>(props: {
  root: RawNode<D>;
  onSize: (root: SizedRawNode<D>) => void;
}) {
  const { root, onSize } = props;
  const el = useRef<HTMLDivElement>(null);
  const nodeList = expandTreeToArray(root);
  useLayoutEffect(() => {
    if (!el.current?.children.length) {
      return;
    }
    const sizedDate = prepareNodeSize(
      root,
      (elId) => {
        const el = document.getElementById(elId);
        if (el) {
          const rect = el.getBoundingClientRect();
          return [rect.width, rect.height];
        }
        return [113, 30];
      },
      idPrefix,
    );
    console.log('onSize', sizedDate);
    onSize(sizedDate);
  }, [root, onSize]);

  return (
    <div className={sizeMeasurerClass} ref={el}>
      {nodeList.map((node) => {
        return (
          <NodeContent
            key={`m_${node.id}`}
            id={node.id}
            data={node.payload as Payload}
            idPrefix={idPrefix}
          />
        );
      })}
    </div>
  );
}
