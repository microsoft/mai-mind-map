import React, { memo, useMemo } from 'react';
import { markdown } from '../../mind-map/render/helpers/markdown';

interface PageNodeContentProps {
    content: string;
    className?: string;
    style?: React.CSSProperties;
}

export const PageNodeContent = (props: PageNodeContentProps) => {
    const { content, className, style } = props;
    const contentHTML = useMemo(() => markdown.makeHtml(content), [content]);
    return (
        <div
            className={className}
            style={style}
            dangerouslySetInnerHTML={{ __html: contentHTML }}
        />
    );
};