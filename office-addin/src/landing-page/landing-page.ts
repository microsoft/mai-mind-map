/*
 * Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
 * See LICENSE in the project root for license information.
 */

import { css, customElement, FASTElement, html } from "@microsoft/fast-element";

const template = html`Signed in`;
const styles = css``;



@customElement({
  name: "landing-page",
  template,
  styles,
})
export class TaskPane extends FASTElement {
  connectedCallback(): void {
    Office.onReady( () => {
      console.log("Office is ready");
      fetch(`${location.origin}/cookie/unrestrict`, {
        method: "GET"
      }).then((response) => {
        if(response.ok) {
          this.notifySignedIn();
        }
      })
      // Add any initialization code for your dialog here.
    });
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
