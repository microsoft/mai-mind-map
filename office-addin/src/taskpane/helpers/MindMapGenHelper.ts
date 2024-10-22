/*
 * Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
 * See LICENSE in the project root for license information.
 */

/* global URL, Headers, fetch */
export type MindMapUUID = string;
export enum DocumentType {
  DOCX = "docx",
  PPT = "pptx",
}
interface IDocument {
  type: DocumentType;
  title: string;
  content: string;
}

interface IApiParameter {
  from: DocumentType;
  to: "markdown";
  title: string;
  content: string;
}

interface IApiResponse {
  id: MindMapUUID;
}

export class MindMapGenHelper {
  private static readonly GENERATOR_URL = new URL(`${location.origin}/api/gen`);

  static async fromDocument(doc: IDocument): Promise<MindMapUUID> {
    const { id } = await MindMapGenHelper.callApi({
      from: doc.type,
      to: "markdown",
      title: doc.title,
      content: doc.content,
    });

    return id;
  }

  private static async callApi(parameters: IApiParameter): Promise<IApiResponse> {
    const headers = new Headers();
    headers.set("Content-Type", "application/json");

    const response = await fetch(MindMapGenHelper.GENERATOR_URL, {
      headers,
      body: JSON.stringify(parameters),
      method: "POST",
      credentials: "include",
    });

    const responseBody = await response.json();

    if (response.ok && responseBody.id) {
      return responseBody;
    } else {
      throw new Error(
        `API call failed. HTTP status: ${response.status}. Response from server: ${JSON.stringify(responseBody)}`
      );
    }
  }
}
