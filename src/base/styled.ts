// @ts-ignore
import { compile, stringify } from 'stylis';

const container = document.createElement('style');
document.head.append(container);
// biome-ignore lint/style/noNonNullAssertion: <explanation>
const sheet = container.sheet!;

function uuid() {
  return `s-${Math.round((Math.random() + 1) * Date.now()).toString(36)}`;
}

function insert(head: string, body: string) {
  sheet.insertRule(`${head} {${body}}`);
}

function compose(list: string[], templates: Array<string | number>) {
  let body = list[0];
  for (let i = 0, len = templates.length; i < len; i += 1) {
    body += templates[i] + list[i + 1];
  }
  return body;
}

function apply(cssStr: string) {
  const rules = compile(cssStr);
  for (let i = 0, len = rules.length; i < len; i += 1) {
    const rule = stringify(rules[i], i, rules, stringify);
    if (rule) {
      const index = sheet.cssRules.length;
      sheet.insertRule(rule, index);
    }
  }
}

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export function css(list: any, ...templates: Array<string | number>) {
  const id = uuid();
  const body = compose(list, templates);
  apply(`.${id} {${body}}`);
  return id;
}

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export function keyframes(list: any, ...templates: Array<string | number>) {
  const id = uuid();
  insert(`@keyframes ${id}`, compose(list, templates));
  return id;
}

export function istyled(cls: string) {
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  return (list: any, ...templates: Array<string | number>) => {
    insert(cls, compose(list, templates));
  };
}
