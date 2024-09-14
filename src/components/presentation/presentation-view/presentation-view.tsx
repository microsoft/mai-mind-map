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

    private buildNewPage = (pageConfig: PresentationViewComponentConfig, newPage: PresentationPage, shouldAnimation: boolean, switchMode: PresentationSwitchMode) => {
        let newpPageConfig = pageConfig;
        newpPageConfig.animation = false;
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
                    newpPageConfig.page = newPage;
                    newpPageConfig.style = { 
                        transform: transformCenter,
                        transition,
                        visibility: 'visible',
                    };
                } else if (switchMode === PresentationSwitchMode.PUSH) {
                    // move to right
                    newpPageConfig.style = { 
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
                    newpPageConfig.style = { 
                        transform: transformLeft, 
                        transition: undefined,
                        visibility: 'hidden',
                    };
                } else if (switchMode === PresentationSwitchMode.PUSH) {
                    // move to center
                    newpPageConfig.page = newPage;
                    newpPageConfig.style = { 
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
                    newpPageConfig.style = { 
                        transform: transformRight,
                        transition,
                        visibility: 'hidden',
                    };
                } else if (switchMode === PresentationSwitchMode.PUSH) {
                    // move to left
                    newpPageConfig.style = { 
                        transform: transformLeft,
                        transition,
                        visibility: 'hidden',
                    };
                } else if (switchMode === PresentationSwitchMode.UPDATE) {
                    // update
                    newpPageConfig.page = newPage;
                    newpPageConfig.style = { 
                        transform: transformCenter,
                        transition,
                        visibility: 'visible',
                    };
                    newpPageConfig.animation = true;
                }
            } else {
                // move to center
                newpPageConfig.page = newPage;
                newpPageConfig.style = { 
                    transform: transformCenter,
                    transition,
                    visibility: 'visible',
                };
            }
        }
        return newpPageConfig;
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
            <div className='presentation-view' id={id}>
                <PageViewComponent
                    page={pageA.page}
                    style={{
                        ...pageA.style,
                    }}
                    animation={pageA.animation}
                ></PageViewComponent>
                <PageViewComponent
                    page={pageB.page}
                    style={{
                        ...pageB.style,
                    }}
                    animation={pageB.animation}
                ></PageViewComponent>
                <PageViewComponent
                    page={pageC.page}
                    style={{
                        ...pageC.style,
                    }}
                    animation={pageC.animation}
                ></PageViewComponent>
                <div className='presentation-control-bar'>
                    <button onClick={this.prevPage}>Prev</button>
                    <button onClick={this.nextPage}>Next</button>
                    <button onClick={exitFullscreen}>
                        Exit
                    </button>
                </div>
            </div>
        );
    }
}

export default PresentationViewComponent;