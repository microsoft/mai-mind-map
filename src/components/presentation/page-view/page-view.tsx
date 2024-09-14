import React, { Component } from 'react';
import { PresentationMode, PresentationPage } from '../presentation-model/presentation-page';
import './page-view.css';
import { PageTreeComponent, PageTreeLinePoint } from '../page-tree/page-tree';

interface PageViewComponentProps {
    page: PresentationPage | null;
    style?: React.CSSProperties;
    animation?: boolean;
}

interface PageViewComponentState {
    beiginPoint?: PageTreeLinePoint;
    endPoints?: PageTreeLinePoint[];
}

class PageViewComponent extends Component<PageViewComponentProps, PageViewComponentState> {
    private selfRef: React.RefObject<HTMLDivElement>;
    private treeAnimationTriggerRef: React.RefObject<HTMLDivElement>;

    private mainRef: React.RefObject<HTMLDivElement>;
    private treeContentRef: React.RefObject<HTMLDivElement>;
    private resizeObserver: ResizeObserver | null;

    constructor(props: PageViewComponentProps) {
        super(props);
        this.selfRef = React.createRef();
        this.treeAnimationTriggerRef = React.createRef();
        this.mainRef = React.createRef();
        this.treeContentRef = React.createRef();
        this.resizeObserver = null;

        this.state = {
        };
    }

    componentDidMount() {
        this.resizeObserver = new ResizeObserver(this.updatePageTree);
        if (this.treeAnimationTriggerRef.current) {
            this.resizeObserver.observe(this.treeAnimationTriggerRef.current);
        }
    }

    componentDidUpdate(prevProps: Readonly<PageViewComponentProps>, prevState: Readonly<PageViewComponentState>, snapshot?: any): void {
        if (prevProps.page !== this.props.page) {
            this.updatePageTree();
        }
    }

    componentWillUnmount() {
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
        }
    }

    updatePageTree = () => {
        if (!this.selfRef.current) {
            return;
        }
        if (!this.mainRef.current) {
            return;
        }
        if (!this.treeContentRef.current) {
            return;
        }

        const selfRect = this.selfRef.current.getBoundingClientRect();

        const mainRect = this.mainRef.current.getBoundingClientRect();

        const div1RightX = mainRect.right - selfRect.left + 20;
        const div1RightY = mainRect.top + mainRect.height / 2;

        const beiginPoint: PageTreeLinePoint = { x: div1RightX, y: div1RightY };

        const endPoints: PageTreeLinePoint[] = Array.from(this.treeContentRef.current.querySelectorAll('.presentation-view-tree-item-line'))?.map(childDiv => {
            const childRect = childDiv.getBoundingClientRect();

            const x = childRect.left - selfRect.left - 20;
            const y = childRect.top + childRect.height / 2;

            return { x, y };
        }) || [];

        this.setState({ beiginPoint, endPoints });
    };

    render() {
        const { beiginPoint, endPoints } = this.state;
        const { mode, node, child } = this.props.page || {};
        const childIndex = node?.children?.map(child => child.id).indexOf(child?.id || '') || 0;
        const childrenLength = node?.children?.length || 1;
        const showTitle = (!!node?.text) ? 1 : 0;
        const showNote = (!!node?.note) ? 1 : 0;
        const showImages = (!!node?.images) ? 1 : 0;
        const mainCount = showTitle + showNote + showImages;
        const showTree = mode === PresentationMode.TREE && beiginPoint && endPoints;
        const animation = this.props.animation;
        const animationTime = 0.5;
        const imagesCount = node?.images?.length || 0;
        return (
            <div
                className='presentation-view-component'
                style={this.props.style}
                ref={this.selfRef}
            >
                <div
                    className='presentation-view-tree-animation-trigger'
                    ref={this.treeAnimationTriggerRef}
                    style={{
                        position: 'absolute',
                        width: showTree ? '20%' : '10%',
                        height: showTree ? '20%' : '10%',
                        visibility: 'hidden',
                        transition: animation ? `all ${animationTime}s` : undefined,
                    }}
                ></div>
                <PageTreeComponent
                    beginPoint={beiginPoint || { x: 0, y: 0 }}
                    endPoints={endPoints || []}
                    lineWidth={childrenLength < 30 ? 4 : 2}
                    color='white'
                    style={{
                        transition: animation ? `all ${animationTime}s` : undefined,
                        visibility: showTree ? 'visible' : 'hidden',
                        opacity: showTree ? 1 : 0,
                    }}
                ></PageTreeComponent>
                <div
                    className='presentation-view-main-area'
                    style={{
                        transition: animation ? `all ${animationTime}s` : undefined,
                        transform: showTree ? 'translateX(-30%) scale(0.4)' : 'translateX(0) scale(1)',
                    }}
                >
                    <div
                        className='presentation-view-main-content'
                        ref={this.mainRef}
                        style={{
                            alignItems: 'center',
                            gridTemplateColumns: '1fr',
                            gridTemplateRows: `repeat(${mainCount}, auto)`,
                            maxHeight: '90%',
                            maxWidth: '90%',
                            overflow: 'scroll',
                        }}
                    >
                        {
                            !!showTitle &&
                            <div
                                className='presentation-view-main-title'
                                style={{
                                    transition: animation ? `all ${animationTime}s` : undefined,
                                    fontSize: '156px',
                                    maxWidth: '100%',
                                }}
                            >{node?.text}</div>
                        }
                        {
                            !!showNote &&
                            <div
                                className='presentation-view-main-description'
                                style={{
                                    transition: animation ? `all ${animationTime}s` : undefined,
                                    fontSize: `60px`,
                                    overflow: 'hidden',
                                    maxWidth: '100%',
                                }}
                            >{node?.note}</div>
                        }
                        {
                            !!showImages &&
                            <div
                                className='presentation-view-main-images'
                                style={{
                                    display: 'grid',
                                    gridTemplateRows: '1fr',
                                    gridTemplateColumns: `repeat(${imagesCount}, 1fr)`,
                                    alignItems: 'center',
                                    gap: '20px',
                                    maxWidth: '100%',
                                }}
                            >
                                {
                                    node?.images?.map((image, index) => {
                                        return (
                                            <img
                                                key={index}
                                                src={image}
                                                alt=''
                                                style={{
                                                    objectFit: 'contain',
                                                    maxWidth: `100%`,
                                                }}
                                            />
                                        );
                                    })
                                }
                            </div>
                        }
                    </div>
                </div>
                <div
                    className='presentation-view-tree-content'
                    ref={this.treeContentRef}
                    style={{
                        gridTemplateColumns: `5px 1fr`,
                        gridTemplateRows: `repeat(${childrenLength}, 1fr)`,
                        gap: '10px',
                        alignItems: 'center',
                        transition: animation ? `all ${animationTime}s` : undefined,
                        opacity: showTree ? 1 : 0,
                        width: '50%',
                        position: 'absolute',
                        top: '5%',
                        right: showTree ? '0' : '-50%',
                        bottom: '5%',
                    }}
                >
                    {node?.children?.map((child, index) => {
                        return (
                            <React.Fragment
                                key={child.id}
                            >
                                <div
                                    className='presentation-view-tree-item-line'
                                    style={{
                                        backgroundColor: index === childIndex ? '#E94F4B' : 'transparent',
                                    }}
                                ></div>
                                <div
                                    className='presentation-view-tree-item-title'
                                    style={{
                                        color: index <= childIndex ? 'white' : 'rgba(255, 255, 255, 0.2)',
                                        fontSize: `clamp(12px, ${50 / childrenLength}vh, 48px)`,
                                    }}
                                >
                                    {child.text}
                                </div>
                            </React.Fragment>
                        );
                    })}
                </div>
            </div>
        );
    }
}

export {
    PageViewComponent,
};