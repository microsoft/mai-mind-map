/*
 * Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
 * See LICENSE in the project root for license information.
 */

import { css, customElement, FASTElement, html, observable } from "@microsoft/fast-element";
import { fluentButton, provideFluentDesignSystem } from "@fluentui/web-components";
import { DocumentType, MindMapGenHelper } from "./helpers/MindMapGenHelper";
import { WordHelper } from "./helpers/WordHelper";
import "./components/message-container";

/* global Office, console */

provideFluentDesignSystem().register(fluentButton());

const template = html<TaskPane>`
  <div id="container">
    <h2 id="title">Generate Mind Map</h2>
    <fluent-button
      id="btn-submit-all"
      ?disabled=${(x) => !x.officeIsReady || x.loading}
      :appearance=${"accent"}
      @click=${(x) => x.onSubmitAllButtonClick()}
    >
      Generate using full content
    </fluent-button>
    <fluent-button
      id="btn-submit-selected"
      ?disabled=${(x) => !x.officeIsReady || x.loading}
      :appearance=${"accent"}
      @click=${(x) => x.onSubmitSelectedButtonClick()}
    >
      Generate using selected content
    </fluent-button>
    <div id="message-container-wrapper">
      <message-container :showLoading=${(x) => x.loading}>
      <div slot="message">${(x) => x.message}</div>
    </message-container>
    </div>
  </div>
`;

const styles = css`
  :host {
    display: block;
    width: 100%;
    height: 100%;
    padding: 20px;
    box-sizing: border-box;
  }

  #title {
    font-family:
      system-ui,
      -apple-system,
      sans-serif;
    text-align: center;
  }

  #container {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }

  #message-container-wrapper {
    margin-top: 10px;
  }
`;

@customElement({
  name: "task-pane",
  template,
  styles,
})
export class TaskPane extends FASTElement {
  @observable officeIsReady: boolean = false;
  @observable loading: boolean = false;
  @observable message: string = "";

  connectedCallback(): void {
    super.connectedCallback();
    Office.onReady().then((info) => {
      if (info.host === Office.HostType.Word) {
        this.officeIsReady = true;
      }
    });
  }

  onSubmitAllButtonClick = async () => {
    this.loading = true;
    try {
      this.showMessage("Generating mind map for the document...");
      const [title, content] = await Promise.all([WordHelper.getDocumentTitle(), WordHelper.getDocumentContent()]);

      const mindMapUuid = await MindMapGenHelper.fromDocument({
        type: DocumentType.DOCX,
        title,
        content,
      });

      await WordHelper.showMindMapDialog(mindMapUuid);
      this.clearMessage();
    } catch (e) {
      this.showMessage(e.message);
      console.error(e);
    } finally {
      this.loading = false;
    }
  }

  onSubmitSelectedButtonClick = async () => {
    this.loading = true;
    try {
      this.showMessage("Generating mind map for selected text...");
      const [title, selectedContent] = await Promise.all([
        WordHelper.getDocumentTitle(),
        WordHelper.getDocumentSelectedContent(),
      ]);

      const mindMapUuid = await MindMapGenHelper.fromDocument({
        type: DocumentType.DOCX,
        title,
        content: selectedContent,
      });

      await WordHelper.showMindMapDialog(mindMapUuid);
      this.clearMessage();
    } catch (e) {
      this.showMessage(e.message);
      console.error(e);
    } finally {
      this.loading = false;
    }
  }

  private showMessage(message: string) {
    this.message = message;
  }

  private clearMessage() {
    this.message = "";
  }
}
