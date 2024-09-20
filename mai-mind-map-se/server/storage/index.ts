import fs from 'fs';
import { join, sep } from 'path';
import { BlobServiceClient, BlockBlobUploadResponse } from '@azure/storage-blob';
import { v4 as uuidv4 } from 'uuid';
const CONTAINER_NAME = 'docs'
const DEFAULT_BLANK_DOC_BUFFER = Buffer.from(`{}`, 'utf8');
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

type Blob = {
  name: string,
  createdOn?: Date,
  lastModified: Date,
}

type Response = {
  id?: string,
  message?: string,
  list?: Blob[],
  content?: string
};

export async function GetDocList(): Promise<Response> {
  const list: Blob[] = [];
  try {
    const containerClient = blobServiceClient.getContainerClient(CONTAINER_NAME);
    let blobs = containerClient.listBlobsFlat();
    for await (const blob of blobs) {
      list.push({
        name: blob.name,
        createdOn: blob.properties.createdOn,
        lastModified: blob.properties.lastModified,
      });
    }
    return { list };
  } catch (err: unknown) {
    return { message: handleError(err), list };
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
    return { message: 'must specify a doc ID' };
  }
  if (blobName.length !== 36) {
    return { message: 'invalid doc ID' };
  }
  try {
    const containerClient = blobServiceClient.getContainerClient(CONTAINER_NAME);
    const blobClient = containerClient.getBlobClient(blobName);
    const downloadBlockBlobResponse = await blobClient.download();
    const content = (
      await streamToBuffer(downloadBlockBlobResponse.readableStreamBody) as Blob
    ).toString();
    return { id: blobName, content };
  } catch (err: unknown) {
    return { id: blobName, message: handleError(err) };
  }
}

export async function UpdateDocByID(blobName: string, content: Buffer): Promise<Response> {
  if (blobName === undefined || blobName === null || blobName === '') {
    return { message: 'must specify a doc ID' };
  }
  if (blobName.length !== 36) {
    return { message: 'invalid doc ID' };
  }
  try {
    const containerClient = blobServiceClient.getContainerClient(CONTAINER_NAME);
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    let uploadBlobResponse: BlockBlobUploadResponse;
    uploadBlobResponse = await blockBlobClient.upload(content, content.length);
    return { id: blobName };
  } catch (err: unknown) {
    return { id: blobName, message: handleError(err) };
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
    return { id: newDocID };
  } catch (err: unknown) {
    return { id: undefined, message: handleError(err) };
  }
}

export function handleError(error: unknown): string {
  if (typeof error === 'string') {
    return error;
  } else if (error instanceof Error) {
    return error.message.toString();
  }
  return 'Unknown error';
}
