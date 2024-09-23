declare class Converter {
  constructor(option?: Record<string, any>);
  makeHtml(md: string): string;
  makeMarkdown(html: string): string;
}
interface Showdown {
  Converter: typeof Converter;
}

declare const showdown: Showdown;
export default showdown;
