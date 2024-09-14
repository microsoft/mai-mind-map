export interface Payload
  extends Record<string, boolean | string | number | undefined> {
  collapsed?: boolean; // whether the node is collapsed
  content: string; // content of the node
}
