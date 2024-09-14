interface PresentationNode {
    id: string;
    text?: string;
    note?: string;
    images?: string[];

    children?: PresentationNode[];
}

export type {
    PresentationNode,
};