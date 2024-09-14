import React, { Component } from 'react';
import { PageViewComponent } from '../page-view/page-view';
import { PresentationControllerBase as PresentationController, PresentationPage } from '../presentation-model/presentation-controller';
import { PresentationNode } from '../presentation-model/presentation-node';
import './presentation-view.css';
import { PresentationMode } from '../presentation-model/presentation-page';

enum PresentationSwitchMode {
    PUSH,
    BACK,
    UPDATE,
}

interface PresentationViewComponentProps extends React.HTMLAttributes<HTMLDivElement> {
    rootNode: PresentationNode;
    targetNode?: PresentationNode;
    exitFullscreen: () => void;
    id?: string;
}

interface PresentationViewComponentConfig {
    page: PresentationPage | null;
    style?: React.CSSProperties;
    animation?: boolean;
}

interface PresentationViewComponentState {
    pageA: PresentationViewComponentConfig;
    pageB: PresentationViewComponentConfig;
    pageC: PresentationViewComponentConfig;
}

class PresentationViewComponent extends Component<PresentationViewComponentProps, PresentationViewComponentState> {
    private presentationController = new PresentationController();

    constructor(props: PresentationViewComponentProps) {
        super(props);
        this.state = {
            pageA: { page: null, style: { transform: 'translateX(-100%)' } },
            pageB: { page: null, style: { transform: 'translateX(0)' } },
            pageC: { page: null, style: { transform: 'translateX(100%)' } },
        };
    }

    componentDidMount(): void {
        const { rootNode, targetNode } = this.props;
        const lastPage = this.presentationController.pageForCurrentIndex();
        this.presentationController.updateTree(rootNode);
        const newPage = this.presentationController.presentPage(targetNode);
        if (!newPage) {
            return;
        }
        this.switchPage(lastPage, newPage);

        document.addEventListener('keydown', this.handleKeybordEvent);
    }

    componentWillUnmount(): void {
        document.removeEventListener('keydown', this.handleKeybordEvent);
    }

    componentDidUpdate(prevProps: Readonly<PresentationViewComponentProps>, prevState: Readonly<PresentationViewComponentState>, snapshot?: any): void {
        const { rootNode } = this.props;
        if (rootNode !== prevProps.rootNode) {
            const lastPage = this.presentationController.pageForCurrentIndex();
            const newPage = this.presentationController.updateTree(rootNode);
            if (!newPage) {
                return;
            }
            this.switchPage(lastPage, newPage);
        }
    }

    private handleKeybordEvent = (event: { key: any; }) => {
        switch (event.key) {
            case 'ArrowUp':
            case 'ArrowLeft':
            case 'PageUp':
                this.prevPage();
                break;
            case 'ArrowDown':
            case 'ArrowRight':
            case 'PageDown':
            case 'Enter':
            case ' ':
                this.nextPage();
                break;
            default:
                break;
        }
    }

    private nextPage = () => {
        const lastPage = this.presentationController.pageForCurrentIndex();
        const newPage = this.presentationController.presentNextPage();
        if (!newPage) {
            return;
        }
        this.switchPage(lastPage, newPage);
    }

    private prevPage = () => {
        const lastPage = this.presentationController.pageForCurrentIndex();
        const newPage = this.presentationController.presentPrevPage();
        if (!newPage) {
            return;
        }
        this.switchPage(lastPage, newPage);
    }

    private isAParentOfB = (nodeA: PresentationNode, nodeB?: PresentationNode) => {
        if (!nodeB) {
            return false;
        }
        if (!nodeA.children) {
            return false;
        }
        for (let child of nodeA.children) {
            if (child.id === nodeB.id) {
                return true;
            }
            if (this.isAParentOfB(child, nodeB)) {
                return true;
            }
        }
        return false;
    }

    private buildNewPage = (pageConfig: PresentationViewComponentConfig, 
        newPage: PresentationPage, 
        shouldAnimation: boolean, 
        switchMode: PresentationSwitchMode,
    ) => {
        let newPageConfig = pageConfig;
        newPageConfig.animation = false;
        const transitionTime = 0.5;
        const transition = `transform ${transitionTime}s, visibility ${transitionTime}s`;
        const transformCenter = 'translateX(0)';
        const transformLeft = 'translateX(-100%)';
        const transformRight = 'translateX(100%)';
        if (pageConfig.style?.transform === transformLeft) {
            // left page
            if (shouldAnimation) {
                if (switchMode === PresentationSwitchMode.BACK) {
                    // move to center
                    newPageConfig.page = newPage;
                    newPageConfig.style = {
                        transform: transformCenter,
                        transition,
                        visibility: 'visible',
                    };
                } else if (switchMode === PresentationSwitchMode.PUSH) {
                    // move to right
                    newPageConfig.style = {
                        transform: transformRight,
                        transition: undefined,
                        visibility: 'hidden',
                    };
                }
            }
        } else if (pageConfig.style?.transform === transformRight) {
            // right page
            if (shouldAnimation) {
                if (switchMode === PresentationSwitchMode.BACK) {
                    // move to left
                    newPageConfig.style = {
                        transform: transformLeft,
                        transition: undefined,
                        visibility: 'hidden',
                    };
                } else if (switchMode === PresentationSwitchMode.PUSH) {
                    // move to center
                    newPageConfig.page = newPage;
                    newPageConfig.style = {
                        transform: transformCenter,
                        transition,
                        visibility: 'visible',
                    };
                }
            }
        } else {
            // center page
            if (shouldAnimation) {
                if (switchMode === PresentationSwitchMode.BACK) {
                    // move to right
                    newPageConfig.style = {
                        transform: transformRight,
                        transition,
                        visibility: 'hidden',
                    };
                } else if (switchMode === PresentationSwitchMode.PUSH) {
                    // move to left
                    newPageConfig.style = {
                        transform: transformLeft,
                        transition,
                        visibility: 'hidden',
                    };
                } else if (switchMode === PresentationSwitchMode.UPDATE) {
                    // update
                    newPageConfig.page = newPage;
                    newPageConfig.style = {
                        transform: transformCenter,
                        transition,
                        visibility: 'visible',
                    };
                    newPageConfig.animation = true;
                }
            } else {
                // move to center
                newPageConfig.page = newPage;
                newPageConfig.style = {
                    transform: transformCenter,
                    transition,
                    visibility: 'visible',
                };
            }
        }
        return newPageConfig;
    }

    private switchPage = (lastPage: PresentationPage | null, newPage: PresentationPage) => {
        if (newPage === lastPage) {
            return;
        }

        const { pageA, pageB, pageC } = this.state;
        const shouldAnimation = !!lastPage;
        let switchMode = PresentationSwitchMode.PUSH;

        if (newPage.node.id === lastPage?.node.id) {
            switchMode = PresentationSwitchMode.UPDATE;
        } else if (this.isAParentOfB(newPage.node, lastPage?.node)) {
            switchMode = PresentationSwitchMode.BACK;
        }

        this.setState({
            pageA: this.buildNewPage(pageA, newPage, shouldAnimation, switchMode),
            pageB: this.buildNewPage(pageB, newPage, shouldAnimation, switchMode),
            pageC: this.buildNewPage(pageC, newPage, shouldAnimation, switchMode),
        });
    };

    render() {
        const { id, exitFullscreen } = this.props;
        const { pageA, pageB, pageC } = this.state;
        return (
            <div
                className='presentation-view'
                id={id}
            >
                <div
                    onClick={this.nextPage}
                    style={{
                        position: 'absolute',
                        left: 0,
                        right: 0,
                        top: 0,
                        bottom: 0,
                    }}
                >
                    <PageViewComponent
                        ref={this.pageARef}
                        page={pageA.page}
                        style={{
                            ...pageA.style,
                        }}
                        animation={pageA.animation}
                    ></PageViewComponent>
                    <PageViewComponent
                        ref={this.pageBRef}
                        page={pageB.page}
                        style={{
                            ...pageB.style,
                        }}
                        animation={pageB.animation}
                    ></PageViewComponent>
                    <PageViewComponent
                        ref={this.pageCRef}
                        page={pageC.page}
                        style={{
                            ...pageC.style,
                        }}
                        animation={pageC.animation}
                    ></PageViewComponent>

                </div>

                <div className='presentation-control-bar'>
                    <button
                        onClick={this.prevPage}
                        style={{
                            cursor: 'pointer',
                        }}
                    >Prev</button>
                    <button
                        onClick={this.nextPage}
                        style={{
                            cursor: 'pointer',
                        }}
                    >Next</button>
                    <button
                        onClick={exitFullscreen}
                        style={{
                            cursor: 'pointer',
                        }}
                    >
                        Exit
                    </button>
                </div>
            </div>
        );
    }
}

export default PresentationViewComponent;