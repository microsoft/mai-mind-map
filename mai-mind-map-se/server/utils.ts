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
