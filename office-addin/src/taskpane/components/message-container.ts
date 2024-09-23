/*
 * Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
 * See LICENSE in the project root for license information.
 */

import { attr, css, customElement, FASTElement, html } from "@microsoft/fast-element";
import { provideFluentDesignSystem, fluentProgressRing } from "@fluentui/web-components";

provideFluentDesignSystem().register(fluentProgressRing());

const template = html<MessageContainer>`
  <div id="container">
    <div id="spinner-container"><fluent-progress-ring></fluent-progress-ring></div>
    <div id="message-container"><slot name="message"></slot></div>
  </div>
`;

const styles = css`
  :host {
    display: block;
  }

  #container {
    display: flex;
    align-items: center;
  }

  #spinner-container {
    width: fit-content;
    flex-grow: 0;
    flex-shrink: 0;
  }

  #message-container {
    width: 100%;
    flex-grow: 1;
  }
`;

@customElement({
  name: "message-container",
  template,
  styles,
})
export class MessageContainer extends FASTElement {
  @attr showLoading: boolean = false;
}
