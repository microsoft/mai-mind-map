import { css } from '@root/base/styled';
import { PureComponent } from 'react';
import ReactDOM from 'react-dom';
import { icons } from './icons';
import { OutlineNode, ViewModel } from './view-model';

/**
 * ----------------------------------------------------------------------------------------------------
 * Styles for this file (install `vscode-style-components` ext for better dev)
 * ----------------------------------------------------------------------------------------------------
 */
const SBox = css`
  z-index: 1000000;
  position: fixed;
  inset: 0;
`;
const SContent = css`
  position: absolute;
  border: 1px solid rgba(17, 31, 44, 0.12);
  box-shadow: rgba(0, 0, 0, 0.1) 1px 3px 8px 0px;
  background-color: rgb(255, 255, 255);
  border-radius: 4px;
  padding: 8px;
`;
const SActionItem = css`
  cursor: pointer;
  padding: 4px;
  width: 24px;
  height: 24px;
  transition: 100ms;
  &.active,
  &:hover {
    background: rgba(25, 31, 37, 0.08);
    border-radius: 4px;
  }
`;
const SColors = css`
  display: flex;
  align-items: center;
  justify-content: start;
  gap: 2px;
  .${SActionItem}>span {
    display: block;
    border-radius: 16px;
    width: 16px;
    height: 16px;
  }
`;
const SBUI = css`
  margin-top: 8px;
  display: flex;
  align-items: center;
  justify-content: start;
  gap: 2px;
`;

/**
 * ------------------------------------------------------------------------------------------
 * Component to render the toolbox of tree node, user can adjust format here
 * ------------------------------------------------------------------------------------------
 */

interface Props {
  view: ViewModel;
  node: OutlineNode;
}
interface State {
  visible?: [x: number, y: number];
}

const COLORS = [
  'rgb(242, 168, 159)',
  'rgb(255, 250, 156)',
  'rgb(159, 232, 153)',
  'rgb(159, 228, 223)',
  'rgb(159, 212, 252)',
  'rgb(203, 177, 242)',
  'rgb(217, 217, 217)',
];
const container = document.createElement('div');
document.body.append(container);

export default class Toolbox extends PureComponent<Props, State> {
  public state: State = {};

  public show(x: number, y: number) {
    this.setState({ visible: [x, y] });
  }

  private hide() {
    this.setState({ visible: undefined });
  }

  private renderColors() {
    const { view, node } = this.props;
    const { payload, id } = node;
    return (
      <div className={SColors}>
        {COLORS.map((color) => {
          const active = payload.hilight === color;
          return (
            <div
              key={color}
              className={SActionItem + (active ? ' active' : '')}
              onClick={() => {
                if (active) {
                  view.update(id, { ...payload, hilight: undefined });
                } else {
                  view.update(id, { ...payload, hilight: color });
                }
              }}
            >
              <span style={{ backgroundColor: color }}/>
            </div>
          );
        })}
      </div>
    );
  }

  private renderBIU() {
    const { view, node } = this.props;
    const { payload, id } = node;
    return (
      <div className={SBUI}>
        <div
          className={SActionItem + (payload.bold ? ' active' : '')}
          onClick={() => {
            view.update(id, { ...payload, bold: !payload.bold });
          }}
        >{icons.bold}</div>
        <div
          className={SActionItem + (payload.italic ? ' active' : '')}
          onClick={() => {
            view.update(id, { ...payload, italic: !payload.italic });
          }}
        >{icons.italic}</div>
        <div
          className={SActionItem + (payload.underline ? ' active' : '')}
          onClick={() => {
            view.update(id, { ...payload, underline: !payload.underline });
          }}
        >{icons.underline}</div>
        <div
          className={SActionItem}
          onClick={() => {
            const { bold, italic, underline, hilight, ...rest } = payload;
            view.update(id, rest);
          }}
        >{icons.clearFormat}</div>
      </div>
    );
  }

  render() {
    const { visible } = this.state;
    if (!visible) return null;

    const [left, top] = visible;
    return ReactDOM.createPortal(
      <div
        className={SBox}
        onClick={() => this.hide()}>
        <div
          className={SContent}
          style={{ left, top }}
          onClick={e => e.stopPropagation()}>
          <div style={{ fontSize: 14, marginBottom: 6 }}>Format</div>
          {this.renderColors()}
          {this.renderBIU()}
        </div>
      </div>,
      container,
    );
  }
}
