import axios from 'axios';
import marked from 'marked';
import { v4 as uuidv4 } from 'uuid';
import { NewDoc } from '../storage';
import { ROOT_ID, genId, handleError, readConfig } from '../utils';

type GenRequest = {
  from: string;
  to: string;
  title: string;
  content: string;
};

type GenResponse = {
  id?: string;
  content?: string;
  message?: string;
};

type NodeId = string; // 8 bit - 36 radix
type PropsKey = string;
type Timestamp = number;
type Timestamped<T> = { t: Timestamp, v: T };
type MindMapCp = Record<NodeId, Partial<{
  stringProps: Record<PropsKey, Timestamped<string>>;
  // `content` is the text of the node
  numberProps: Record<PropsKey, Timestamped<number>>;
  booleanProps: Record<PropsKey, Timestamped<boolean>>;
  children: Timestamped<NodeId>[];
}>>;

const conf = readConfig();

/**
 * Generates a new document based on the provided input.
 *
 * @param body - The input data as a Buffer, expected to be a JSON string
 * containing the generation request.
 * @returns A promise that resolves to a GenResponse object.
 *
 * The function performs the following steps:
 * 1. Parses the input buffer to a GenRequest object.
 * 2. Validates the input fields (`from`, `to`, `title`, `content`).
 * 3. Sends a POST request to an external API to generate a mind map.
 * 4. Converts the API response to a mind map format.
 * 5. Creates a new document with the generated mind map content.
 *
 * @throws Will return an error message if any of the input fields are
 * invalid or if the API request fails.
 */
export async function Gen(body: Buffer): Promise<GenResponse> {
  try {
    const req: GenRequest = body as unknown as GenRequest;
    if (req.from === '') {
      return { message: 'must specify a input doc type' };
    }
    if (req.from !== 'docx' && req.from !== 'pptx' && req.from !== 'mind') {
      return { message: 'invalid input doc type' };
    }
    if (req.to === '') {
      return { message: 'must specify a input doc type' };
    }
    if (req.to !== 'markdown') {
      return { message: 'invalid output doc type' };
    }
    if (req.content === '') {
      return { message: 'must specify a input doc content' };
    }
    if (req.from === 'mind') {
      return ToMarkdown(req);
    }
    let data = JSON.stringify({
      "Url": req.title ? req.title : 'test',
      "PageContent": req.content
    });

    let config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: `${conf.NONE_STREAMING_AI_GENERATION_ENDPOINT}?features=udsmindtoken5`,
      headers: {
        'Content-Type': 'application/json',
      },
      data: data
    };
    const result = await axios.request(config);
    const tokens = marked.lexer(result.data.result);
    const cp = tokensToMindMapCp(tokens);
    if (req.title !== '') {
      cp[ROOT_ID].stringProps!.content.v = req.title;
    }
    const docID = uuidv4();
    return await NewDoc(docID, Buffer.from(JSON.stringify(cp)));
  } catch (err: unknown) {
    return { message: handleError(err) };
  }
}

/**
 * Converts a list of marked tokens into a MindMapCp structure.
 *
 * @param tokens - The list of marked tokens to convert.
 * @returns A MindMapCp object representing the hierarchical structure of the tokens.
 */
export function tokensToMindMapCp(tokens: marked.TokensList): MindMapCp {
  const ts = Date.now();
  const mindMap: MindMapCp = {
    [ROOT_ID]: {
      children: [],
      stringProps: { content: { t: ts, v: 'Root' } }
    }
  };
  const stack: { nodeId: NodeId, level: number }[] = [{ nodeId: ROOT_ID, level: 0 }];

  for (const token of tokens) {
    if (token.type === 'heading') {
      let nodeId = genId();
      const node = {
        stringProps: { content: { t: ts, v: token.text } },
        children: []
      };

      if (token.depth === 1) {
        nodeId = ROOT_ID;
        mindMap[ROOT_ID].stringProps = node.stringProps
      } else {
        while (stack.length > 0 && stack[stack.length - 1].level >= token.depth) {
          stack.pop();
        }

        const parent = stack[stack.length - 1];
        mindMap[parent.nodeId].children!.push({ t: ts, v: nodeId });
      }

      mindMap[nodeId] = node;
      stack.push({ nodeId, level: token.depth });
    }

    if (token.type === 'list') {
      for (const item of token.items) {
        const nodeId = genId();
        const node = {
          stringProps: { content: { t: ts, v: item.text } },
          children: []
        };

        const parent = stack[stack.length - 1];
        mindMap[parent.nodeId].children!.push({ t: ts, v: nodeId });
        mindMap[nodeId] = node;
      }
    }
  }

  return mindMap;
}

/**
 * Converts a MindMapCp object to a Markdown string representation.
 *
 * @param mindMap - The MindMapCp object to convert.
 * @returns The Markdown string representation of the mind map.
 */
function mindMapCpToMarkdown(mindMap: MindMapCp): string {
  let markdownContent = '';

  function traverse(nodeId: NodeId, level: number): void {
    const node = mindMap[nodeId];
    if (!node) return;

    if (node.stringProps?.content) {
      const headingPrefix = '#'.repeat(level);
      markdownContent += `${headingPrefix} ${node.stringProps.content.v}\n\n`;
    }

    if (node.children) {
      for (const child of node.children) {
        traverse(child.v, level + 1);
      }
    }
  }

  traverse(ROOT_ID, 1);
  return markdownContent;
}


/**
 * Converts a given GenRequest body to a markdown format and sends it to a
 * specified AI creation endpoint.
 *
 * @param {GenRequest} body - The request body containing the content to be
 * converted.
 * @returns {Promise<GenResponse>} - A promise that resolves to a GenResponse
 * containing the result of the conversion.
 *
 * @throws {Error} - Throws an error if the conversion or the request fails.
 */
async function ToMarkdown(body: GenRequest): Promise<GenResponse> {
  try {
    const cp = JSON.parse(body.content) as MindMapCp;
    let data = JSON.stringify({
      "Url": 'test',
      "PageContent": mindMapCpToMarkdown(cp),
      "FeatureFlags": ["RAG"],
    });
    let config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: `${conf.NONE_STREAMING_AI_CREATION_ENDPOINT}`,
      headers: {
        'Content-Type': 'application/json',
      },
      data: data
    };
    const result = await axios.request(config);
    return Promise.resolve({ content: result.data.result });
  } catch (err: unknown) {
    return Promise.resolve({ message: handleError(err) });
  }
}
