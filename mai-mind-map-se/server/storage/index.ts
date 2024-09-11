import fs from 'fs';
import { join, sep } from 'path';
import { BlobServiceClient, BlockBlobUploadResponse } from '@azure/storage-blob';
import { v4 as uuidv4 } from 'uuid';
const CONTAINER_NAME = 'docs'
const DEFAULT_BLANK_DOC_BUFFER = Buffer.from(`{"name": "new_blank_doc"}`, 'utf8');
const SUCCESS = 'success';
let blobServiceClient: BlobServiceClient;
try {
  blobServiceClient = BlobServiceClient.fromConnectionString(readConfig());
} catch (err: unknown) {
  console.error(handleError(err));
}

function readConfig(): string {
  const contents = fs.readFileSync(join(__dirname, `..${sep}..${sep}config.txt`), 'utf-8');
  const lines = contents.split(/\r?\n/);
  if (lines && lines.length > 0) {
    return lines[0];
  }
  return '';
}

type Response = {
  doc_id?: string,
  msg?: string,
  list?: string[],
  content?: string
};

export async function GetDocList(): Promise<Response> {
  const list: string[] = [];
  try {
    const containerClient = blobServiceClient.getContainerClient(CONTAINER_NAME);
    let blobs = containerClient.listBlobsFlat();
    for await (const blob of blobs) {
      list.push(blob.name);
    }
    return { msg: SUCCESS, list };
  } catch (err: unknown) {
    return { msg: handleError(err), list };
  }
}

async function streamToBuffer(readableStream: unknown) {
  return new Promise((resolve, reject) => {
    const chunks: Uint8Array[] = [];
    (readableStream as any).on("data", (data: Buffer) => {
      chunks.push(data instanceof Buffer ? data : Buffer.from(data));
    });
    (readableStream as any).on("end", () => {
      resolve(Buffer.concat(chunks));
    });
    (readableStream as any).on("error", reject);
  });
}

export async function GetDocByID(blobName: string): Promise<Response> {
  if (blobName === undefined || blobName === null || blobName === '') {
    return { msg: 'must specify a doc ID' };
  }
  if (blobName.length !== 36) {
    return { msg: 'invalid doc ID' };
  }
  try {
    const containerClient = blobServiceClient.getContainerClient(CONTAINER_NAME);
    const blobClient = containerClient.getBlobClient(blobName);
    const downloadBlockBlobResponse = await blobClient.download();
    const content = (
      await streamToBuffer(downloadBlockBlobResponse.readableStreamBody) as Blob
    ).toString();
    return { msg: SUCCESS, content };
  } catch (err: unknown) {
    return { msg: handleError(err) };
  }
}

export async function UpdateDocByID(blobName: string, content: Buffer): Promise<Response> {
  if (blobName === undefined || blobName === null || blobName === '') {
    return { msg: 'must specify a doc ID' };
  }
  if (blobName.length !== 36) {
    return { msg: 'invalid doc ID' };
  }
  try {
    const containerClient = blobServiceClient.getContainerClient(CONTAINER_NAME);
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    let uploadBlobResponse: BlockBlobUploadResponse;
    uploadBlobResponse = await blockBlobClient.upload(content, content.length);
    return { doc_id: blobName, msg: SUCCESS };
  } catch (err: unknown) {
    return { doc_id: blobName, msg: handleError(err) };
  }
}

export async function NewDoc(): Promise<Response> {
  try {
    const containerClient = blobServiceClient.getContainerClient(CONTAINER_NAME);
    const newDocID = uuidv4();
    const blockBlobClient = containerClient.getBlockBlobClient(newDocID);
    let uploadBlobResponse: BlockBlobUploadResponse;
    uploadBlobResponse = await blockBlobClient.upload(DEFAULT_BLANK_DOC_BUFFER,
      DEFAULT_BLANK_DOC_BUFFER.length);
    return { doc_id: newDocID, msg: SUCCESS };
  } catch (err: unknown) {
    return { doc_id: undefined, msg: handleError(err) };
  }
}

function handleError(error: unknown): string {
  if (typeof error === 'string') {
    return error;
  } else if (error instanceof Error) {
    return error.message.toString();
  }
  return 'Unknown error';
}
