import { exampleSourceData } from '../mind-map/MindMap';
import PresentationButton from './presentation-button/presentation-button';
import { PresentationNode } from './presentation-model/presentation-node';

interface Node {
    id: string;
    payload: { content: string };
    children?: Node[];
};

function presentationNodeFromSampleData(node: Node): PresentationNode {
    const { id, payload: { content }, children } = node;
    return {
        id,
        text: content,
        children: children?.map(c => presentationNodeFromSampleData(c)),
    };
}

const mockFromSampleData = presentationNodeFromSampleData(exampleSourceData);

export {
    PresentationButton,
    mockFromSampleData,
};