import { PresentationNode } from '../presentation-model/presentation-node';

enum PresentationMode {
    NODE,
    TREE,
}

interface PresentationPage {
    mode: PresentationMode;
    node: PresentationNode;

    // for mode TREE
    child: PresentationNode | null;
}

class PresentationPageBase implements PresentationPage {
    mode: PresentationMode;
    node: PresentationNode;
    child: PresentationNode | null;

    constructor(node: PresentationNode, child: PresentationNode | null = null) {
        this.mode = child ? PresentationMode.TREE : PresentationMode.NODE;
        this.child = child;
        this.node = node;
    }

    toString(): string {
        if (this.mode === PresentationMode.NODE) {
            return `Node(${this.node.id})`;
        } else {
            return `Tree(${this.node.id}-${this.child ? this.child.id : ''})`;
        }
    }
}

export {
    PresentationPageBase,
    PresentationMode,
}

export type {
    PresentationPage,
}