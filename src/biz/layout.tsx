import { css } from '@root/base/styled';

const SLayoutPage = css`
  height: 100%;
  display: flex;
  align-items: stretch;
`;

const SLayoutSide = css`
  flex: 0 0 auto;
`;

const SLayoutMain = css`
  flex: 1 1 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const SLayoutHead = css`
  flex: 0 0 auto;
`;

const SLayoutContent = css`
  flex: 1 1 100%;
  position: relative;
`;

export const LayoutStyle = {
  Page: SLayoutPage,
  Side: SLayoutSide,
  Main: SLayoutMain,
  Head: SLayoutHead,
  Content: SLayoutContent,
};
