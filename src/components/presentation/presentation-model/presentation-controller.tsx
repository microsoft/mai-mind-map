import { PresentationNode } from '../presentation-model/presentation-node';
import { PresentationPage, PresentationPageBase } from './presentation-page';

interface PresentationController {
    // update tree with root node
    updateTree(root: PresentationNode): PresentationPage | null;

    // present page
    presentPage(node: PresentationNode | null): PresentationPage | null;

    // present next page
    presentNextPage(): PresentationPage | null;

    // present prev page
    presentPrevPage():PresentationPage | null;
}

class PresentationControllerBase implements PresentationController {
    private presentationPages: PresentationPage[] = [];
    private currentPageIndex: number = -1;

    /**
     * update tree with root node
     * @param root the root node
     */
    public updateTree(root: PresentationNode): PresentationPage | null {
        const currentPage = this.pageForCurrentIndex();

        this.presentationPages = [];
        this.currentPageIndex = 0;

        const preOrderTraversal = (node: PresentationNode) => {
            if (!node) {
                return;
            }
            this.presentationPages.push(new PresentationPageBase(node));
            if (node.children) {
                for (let child of node.children) {
                    this.presentationPages.push(new PresentationPageBase(node, child));
                    if (child.children && child.children.length > 0) {
                        preOrderTraversal(child);
                    }
                }
            }
        };

        preOrderTraversal(root);

        // update current page index if needed
        if (currentPage) {
            for (let i = 0; i < this.presentationPages.length; i++) {
                if (currentPage.node.id === this.presentationPages[i].node.id) {
                    this.currentPageIndex = i;
                    break;
                }
            }
        }

        return this.pageForCurrentIndex();
    }

    /**
     * present page
     * @param node the node to present
     */
    public presentPage(node: PresentationNode | null = null): PresentationPage | null {
        if (node) {
            let pageIndex = this.pageIndexForNode(node);
            if (pageIndex >= 0) {
                return this.presentPageForIndex(pageIndex);
            } else {
                return this.updateTree(node);
            }
        }
        return this.pageForCurrentIndex();
    }
    
    /**
     * present next page
     * @returns present result
     */
    public presentNextPage(): PresentationPage | null {
        return this.presentPageForIndex(this.currentPageIndex + 1);
    }
    
    /**
     * present prev page
     * @returns present result
     */
    public presentPrevPage(): PresentationPage | null {
        return this.presentPageForIndex(this.currentPageIndex - 1);
    }

    public pageForCurrentIndex(): PresentationPage | null {
        return this.pageForIndex(this.currentPageIndex);
    }

    private presentPageForIndex(index: number): PresentationPage | null {
        if (index >= 0 && index < this.presentationPages.length) {
            this.currentPageIndex = index;
        }
        return this.pageForIndex(this.currentPageIndex);
    }

    private pageIndexForNode(node: PresentationNode): number {
        for (let i = 0; i < this.presentationPages.length; i++) {
            if (this.presentationPages[i].node.id === node.id) {
                return i;
            }
        }
        return -1;
    }

    private pageForIndex(index: number): PresentationPage | null {
        if (index < 0 || index >= this.presentationPages.length) {
            return null;
        }
        return this.presentationPages[index];
    }
}

export {
    PresentationControllerBase,
 };
 export type {
    PresentationPage,
 }