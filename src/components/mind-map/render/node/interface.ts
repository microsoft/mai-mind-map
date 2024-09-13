export interface RawNode<Mdata> {
  id: string;
  payload: Mdata;
  children?: RawNode<Mdata>[];
}
export interface SizedRawNode<Mdata> extends RawNode<Mdata> {
  content_size: [number, number];
  children?: SizedRawNode<Mdata>[];
}
export type GetSizeFromNodeDate = (elId: string) => [number, number];
export type IsNodeCollapsed<Mdata> = (data: Mdata) => boolean;
