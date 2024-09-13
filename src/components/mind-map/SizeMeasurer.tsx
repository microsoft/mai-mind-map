import { css } from '@base/styled';
import { useLayoutEffect, useMemo, useRef } from 'react';
import { NodeContent } from './NodeContent';
import { RawNode, SizedRawNode, prepareNodeSize } from './render';
import { expandTreeToArray } from './render/model';
import { Payload } from './render/model/interface';

const sizeMeasurerClass = css`
  position: absolute;
  z-index: -1000;
  left: 100%;
  top: 0;
  visibility: hidden;
  pointer-events: none;
`;

const idPrefix = 'mnc';

export function SizeMeasurer<D>(props: {
  root: RawNode<D>;
  onSize: (root: SizedRawNode<D>) => void;
}) {
  const { root, onSize } = props;
  const el = useRef<HTMLDivElement>(null);
  const nodeList = useMemo(() => {
    return expandTreeToArray(root);
  }, [root]);

  useLayoutEffect(() => {
    if (!el.current?.children.length) {
      return;
    }
    const sizedDate = prepareNodeSize(
      root,
      (elId) => {
        const el = document.getElementById(elId);
        if (el) {
          return [el.offsetWidth, el.offsetHeight];
        }
        return [113, 30];
      },
      idPrefix,
    );
    onSize(sizedDate);
  }, [root, nodeList]);

  return (
    <div className={sizeMeasurerClass} ref={el}>
      {nodeList.map((node) => {
        return (
          <NodeContent
            key={node.id}
            id={node.id}
            data={node.payload as Payload}
            idPrefix={idPrefix}
          />
        );
      })}
    </div>
  );
}
