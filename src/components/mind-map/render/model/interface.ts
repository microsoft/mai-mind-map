export interface Payload
  extends Record<string, boolean | string | number | undefined> {
  content: string; // content of the node
  collapsed?: boolean; // whether the node is collapsed
  hilight?: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  link?: string;
}
