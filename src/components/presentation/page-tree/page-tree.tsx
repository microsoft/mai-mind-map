import React, { Component } from 'react';

interface PageTreeLinePoint {
    x: number;
    y: number;
}

interface PageTreeComponentProps {
    beginPoint: PageTreeLinePoint;
    endPoints: PageTreeLinePoint[];
    lineWidth: number;
    color: string;
    style?: React.CSSProperties;
}

interface PageTreeComponentState {

}

class PageTreeComponent extends Component<PageTreeComponentProps, PageTreeComponentState> {
    render() {
        const { beginPoint, endPoints, lineWidth, color, style } = this.props;

        const beginX = beginPoint.x;
        const beginY = beginPoint.y;
        return (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                version="1.1"
                style={{
                    position: 'fixed',
                    width: '100%',
                    height: '100%',
                    ...style,
                }}>
                <circle
                    cx={beginX}
                    cy={beginY}
                    r={lineWidth / 2}
                    fill={color}
                />
                {
                    endPoints.map((endPoint, index) => {
                        const control1X = (beginPoint.x + endPoint.x) / 2;
                        const control1Y = beginPoint.y;

                        const control2X = (beginPoint.x + endPoint.x) / 2;
                        const control2Y = endPoint.y;

                        const endX = endPoint.x;
                        const endY = endPoint.y;
                        if (endX < beginX) {
                            return <React.Fragment
                                key={`${index}`}
                            ></React.Fragment>;
                        }
                        return (
                            <React.Fragment
                                key={`${index}`}
                            >
                                <path
                                    d={`M ${beginX} ${beginY} C ${control1X} ${control1Y} ${control2X} ${control2Y} ${endX} ${endY}`}
                                    fill='none'
                                    strokeWidth={lineWidth}
                                    stroke={color}
                                />
                                <circle
                                    cx={endX}
                                    cy={endY}
                                    r={lineWidth / 2}
                                    fill={color}
                                />
                            </React.Fragment>
                        );
                    })
                }

            </svg>
        );
    }
}

export {
    PageTreeComponent,
}

export type {
    PageTreeLinePoint,
}