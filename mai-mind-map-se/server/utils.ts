import fs from 'fs';
import { join, sep } from 'path';
import axios from 'axios';

export type Config = {
  ENV: string,
  STORAGE_CONN_STRING: string,
  CLOUD_INSTANCE: string,
  TENANT_ID: string,
  CLIENT_ID: string,
  CLIENT_SECRET: string,
  REDIRECT_URI: string,
  POST_LOGOUT_REDIRECT_URI: string,
  GRAPH_API_ENDPOINT: string,
  EXPRESS_SESSION_SECRET: string,
  NONE_STREAMING_AI_GENERATION_ENDPOINT: string,
  NONE_STREAMING_AI_CREATION_ENDPOINT: string,
  STREAMING_AI_CREATION_ENDPOINT: string,
};

/**
 * Reads the configuration from a file and returns the first line.
 *
 * @returns {stConfigring} The first line of the configuration file, or an empty
 * string if the file is empty or cannot be read.
 */
export function readConfig(): Config {
  const contents = fs.readFileSync(join(__dirname, `..${sep}config.json`), 'utf-8');
  var obj: Config = JSON.parse(contents);
  return obj;
}

/**
 * Attaches a given access token to a MS Graph API call
 * @param endpoint: REST API endpoint to call
 * @param accessToken: raw access token string
 */
export async function fetch(endpoint: string, accessToken: string) {
  const options = {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  };
  console.log(`request made to ${endpoint} at: ` + new Date().toString());
  const response = await axios.get(endpoint, options);
  return await response.data;
}

/**
 * Handles an error and returns a string representation of it.
 *
 * @param error - The error to handle. It can be of any type.
 * @returns A string representation of the error. If the error is a string, it
 * returns the error itself.
 * If the error is an instance of `Error`, it returns the error message.
 * Otherwise, it returns 'Unknown error'.
 */
export function handleError(error: unknown): string {
  if (typeof error === 'string') {
    return error;
  } else if (error instanceof Error) {
    return error.message.toString();
  }
  return 'Unknown error';
}

/**
 * Generates a unique identifier string.
 *
 * The identifier is created by generating a random number, converting it to a
 * base-36 string, padding it with zeros to ensure a minimum length, and then
 * slicing it to get a fixed length.
 *
 * @returns {string} A unique identifier string of length 8.
 */
export const genId = () => Math.random().toString(36).padEnd(10, '0').slice(2, 10);

/**
 * The identifier of the root node.
 */
export const ROOT_ID = '00000000';
