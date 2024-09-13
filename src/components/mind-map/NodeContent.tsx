import { css } from '@base/styled';
import { memo } from 'react';
import { Payload } from './render/model/interface';

const SNodeContentText = css`
  display: block;
  display: block;
  width: fit-content;
  max-width: 500px;
  box-sizing: border-box;
  margin: 0;
  padding: 10px;
`;

export const NodeContent = memo<{
  id: string;
  data: Payload;
  editAble?: boolean;
  idPrefix?: string;
}>((props) => {
  const { id, data, editAble = false, idPrefix = 'nc' } = props;
  return (
    <div>
      <pre
        id={`${idPrefix}-${id}`}
        className={SNodeContentText}
        contentEditable={editAble}
      >
        {data.content}
      </pre>
    </div>
  );
});
