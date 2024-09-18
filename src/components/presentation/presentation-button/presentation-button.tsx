import React, { Component } from 'react';

import { PresentationNode } from '../presentation-model/presentation-node';
import PresentationViewComponent from '../presentation-view/presentation-view';

interface PresentationButtonProps {
  rootNode: PresentationNode;
  className?: string;
  id?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

interface PresentationButtonState {
  fullscreen: boolean;
}

class PresentationButton extends Component<
  PresentationButtonProps,
  PresentationButtonState
> {
  constructor(props: PresentationButtonProps) {
    super(props);
    this.state = {
      fullscreen: false,
    };
  }

  componentDidMount(): void {
    document.addEventListener('fullscreenchange', this.handleFullscreenChange);
  }

  componentWillUnmount(): void {
    document.removeEventListener(
      'fullscreenchange',
      this.handleFullscreenChange,
    );
  }

  private handleFullscreenChange = () => {
    this.setState({
      fullscreen: !!document.fullscreenElement,
    });
  };

  private enterFullscreen = () => {
    this.setState(
      {
        fullscreen: true,
      },
      () => {
        const fullscreenView = document.getElementById(
          'presentation-fullscreen-view',
        );
        if (!fullscreenView) {
          return;
        }
        fullscreenView.requestFullscreen &&
          fullscreenView.requestFullscreen().catch((err) => {
            console.error(
              `Error attempting to enable full-screen mode: ${err.message} (${err.name})`,
            );
          });
      },
    );
  };

  private exitFullscreen = () => {
    const fullscreenView = document.getElementById(
      'presentation-fullscreen-view',
    );
    if (!fullscreenView) {
      return;
    }
    document.exitFullscreen && document.exitFullscreen();
    this.setState({
      fullscreen: false,
    });
  };

  render() {
    const { className, id, style, rootNode } = this.props;
    const { fullscreen } = this.state;
    return (
      <div
        id={id}
        onClick={this.enterFullscreen}
        style={{
          ...style,
        }}
        className={className}
      >
        {this.props.children}

        {fullscreen && (
          <PresentationViewComponent
            id="presentation-fullscreen-view"
            rootNode={rootNode}
            exitFullscreen={this.exitFullscreen}
          />
        )}
      </div>
    );
  }
}

export default PresentationButton;
