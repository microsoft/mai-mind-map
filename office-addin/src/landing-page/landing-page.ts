/*
 * Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
 * See LICENSE in the project root for license information.
 */

import { css, customElement, FASTElement, html } from "@microsoft/fast-element";

const template = html``;
const styles = css``;

Office.onReady(function () {
  // Add any initialization code for your dialog here.
});

@customElement({
  name: "task-pane",
  template,
  styles,
})
export class TaskPane extends FASTElement {
  connectedCallback(): void {
    this.notifySignedIn();
  }

  private async notifySignedIn() {
    const signInMessage = {
      success: true,
      id: "",
      name: "",
      email: "",
    };
    Office.context.ui.messageParent(JSON.stringify(signInMessage));
  }
}
