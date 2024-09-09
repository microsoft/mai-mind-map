export interface Payload {
  cachedWidth?: number; // width of the node content
  cachedHeight?: number; // height of the node content
  collapsed?: boolean; // whether the node is collapsed
  content: string; // content of the node
}
