import { BlobServiceClient, BlockBlobUploadResponse } from '@azure/storage-blob';
import { handleError, readConfig } from '../utils';
const CONTAINER_NAME = 'docs'
const DEFAULT_BLANK_DOC_BUFFER = Buffer.from(`{}`, 'utf8');
let blobServiceClient: BlobServiceClient;
try {
  blobServiceClient = BlobServiceClient.fromConnectionString(readConfig().STORAGE_CONN_STRING);
} catch (err: unknown) {
  console.error(handleError(err));
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

/**
 * Retrieves a list of documents from the specified blob storage container.
 *
 * @returns {Promise<Response>} A promise that resolves to a Response object
 * containing the list of documents.
 *
 * The Response object has the following structure:
 * - `list`: An array of Blob objects, each containing:
 * - `name`: The name of the blob.
 * - `createdOn`: The creation date of the blob.
 * - `lastModified`: The last modified date of the blob.
 * - `message` (optional): An error message if an error occurs during the
 *    retrieval process.
 *
 * @throws {Error} If an error occurs while accessing the blob storage container.
 */
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

/**
 * Converts a readable stream into a buffer.
 *
 * @param readableStream - The readable stream to be converted.
 * @returns A promise that resolves to a buffer containing the data from the
 * stream.
 */
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

/**
 * Retrieves a document by its ID from the storage.
 *
 * @param blobName - The ID of the document to retrieve. Must be a non-empty
 * string of length 36.
 * @returns A promise that resolves to a Response object containing the document
 * content or an error message.
 */
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

/**
 * Updates a document in the storage by its ID.
 *
 * @param blobName - The unique identifier of the document to be updated.
 * Must be a non-empty string of length 36.
 * @param content - The content to be uploaded as a Buffer.
 * @returns A promise that resolves to a Response object containing the document
 * ID and an optional message.
 *
 * @throws Will return an error message if the blobName is invalid or if an
 * error occurs during the upload process.
 */
export async function UpdateDocByID(blobName: string, content: Object): Promise<Response> {
  if (blobName === undefined || blobName === null || blobName === '') {
    return { message: 'must specify a doc ID' };
  }
  if (blobName.length !== 36) {
    return { message: 'invalid doc ID' };
  }
  try {
    const containerClient = blobServiceClient.getContainerClient(CONTAINER_NAME);
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    const data = JSON.stringify(content);
    await blockBlobClient.upload(Buffer.from(data), data.length);
    return { id: blobName };
  } catch (err: unknown) {
    return { id: blobName, message: handleError(err) };
  }
}

/**
 * Creates a new document in the storage container with optional default content.
 *
 * @param {Buffer} [default_content] - Optional buffer containing the default
 * content for the new document.
 * @returns {Promise<Response>} - A promise that resolves to an object
 * containing the new document ID or an error message.
 *
 * @throws {Error} - Throws an error if the document creation fails.
 */
export async function NewDoc(docID: string, defaultContent?: Buffer): Promise<Response> {
  try {
    const containerClient = blobServiceClient.getContainerClient(CONTAINER_NAME);
    const blockBlobClient = containerClient.getBlockBlobClient(docID);
    let uploadBlobResponse: BlockBlobUploadResponse;
    let buffer: Buffer = DEFAULT_BLANK_DOC_BUFFER;
    if (defaultContent) {
      buffer = defaultContent;
    }
    uploadBlobResponse = await blockBlobClient.upload(buffer, buffer.length);
    return { id: docID };
  } catch (err: unknown) {
    return { id: undefined, message: handleError(err) };
  }
}

/**
 * Deletes a document by its ID from the storage.
 *
 * @param {string} blobName - The ID of the document to delete. Must be a
 * non-empty string of length 36.
 * @returns {Promise<Response>} - A promise that resolves to a response object
 * containing the ID of the deleted document or an error message.
 *
 * @throws {Error} - Throws an error if the deletion fails.
 */
export async function DeleteDocByID(blobName: string): Promise<Response> {
  if (blobName === undefined || blobName === null || blobName === '') {
    return { message: 'must specify a doc ID' };
  }
  if (blobName.length !== 36) {
    return { message: 'invalid doc ID' };
  }
  try {
    const containerClient = blobServiceClient.getContainerClient(CONTAINER_NAME);
    const blobClient = containerClient.getBlobClient(blobName);
    await blobClient.delete();
    return { id: blobName };
  } catch (err: unknown) {
    return { id: blobName, message: handleError(err) };
  }
}
