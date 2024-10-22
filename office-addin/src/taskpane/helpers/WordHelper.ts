/*
 * Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
 * See LICENSE in the project root for license information.
 */

import { MindMapUUID } from "./MindMapGenHelper";

/* global Office, Word */

export class WordHelper {
  static async getDocumentTitle(): Promise<string> {
    const filename = WordHelper.getFilenameFromUrl(Office.context.document.url);
    const defaultTitle = `word_${Math.round((Math.random() + 1) * Date.now()).toString(36)}`;

    return Word.run(async (context) => {
      const properties = context.document.properties;
      properties.load("title");
      await context.sync();
      return properties.title || filename || defaultTitle;
    });
  }

  static async getDocumentContent(): Promise<string> {
    return Word.run(async (context) => {
      const body: Word.Body = context.document.body;
      body.load("text");
      await context.sync();
      return body.text;
    });
  }

  static async getDocumentSelectedContent() {
    return new Promise<string>((resolve, reject) => {
      Office.context.document.getSelectedDataAsync(
        Office.CoercionType.Text,
        async (asyncResult: Office.AsyncResult<string>) => {
          if (asyncResult.status === Office.AsyncResultStatus.Failed) {
            reject(asyncResult.error.message);
          } else {
            resolve(asyncResult.value);
          }
        }
      );
    });
  }

  static async showMindMapDialog(mindMapUuid: MindMapUUID) {
    return Office.context.ui.displayDialogAsync(`${location.origin}/edit/${mindMapUuid}`);
  }

  static getFilenameFromUrl(documentUrl: string): string {
    return documentUrl.substring(
      Math.max(documentUrl.lastIndexOf("\\"), documentUrl.lastIndexOf("/")) + 1,
      documentUrl.lastIndexOf(".")
    );
  }
}
