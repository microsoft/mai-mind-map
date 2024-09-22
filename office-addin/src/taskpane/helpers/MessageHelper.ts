/*
 * Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
 * See LICENSE in the project root for license information.
 */

/* globals document */

export class MessageHelper {
  static showMessage(message: string) {
    const container = document.getElementById("test-content");
    container.innerText = message;
  }
}
