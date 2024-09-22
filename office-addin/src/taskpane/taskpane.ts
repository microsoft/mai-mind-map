/*
 * Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
 * See LICENSE in the project root for license information.
 */

import { WordHelper } from "./helpers/WordHelper";
import { MindMapGenerator, DocumentType } from "./models/MindMapGenerator";

/* global document, Office */

const submitAllButton = document.getElementById("btn-submit-all");
const submitSelectedButton = document.getElementById("btn-submit-selected");

Office.onReady((info) => {
  if (info.host === Office.HostType.Word) {
    submitAllButton.addEventListener("click", onSubmitAllButtonClick);
    submitSelectedButton.addEventListener("click", onSubmitSelectedButtonClick);
  }
});

async function onSubmitAllButtonClick() {
  const [title, content] = await Promise.all([WordHelper.getDocumentTitle(), WordHelper.getDocumentContent()]);

  const mindMapUuid = await MindMapGenerator.fromDocument({
    type: DocumentType.DOCX,
    title,
    content,
  });

  await WordHelper.showMindMapDialog(mindMapUuid);
}

async function onSubmitSelectedButtonClick() {
  const [title, selectedContent] = await Promise.all([
    WordHelper.getDocumentTitle(),
    WordHelper.getDocumentSelectedContent(),
  ]);

  const mindMapUuid = await MindMapGenerator.fromDocument({
    type: DocumentType.DOCX,
    title,
    content: selectedContent,
  });

  await WordHelper.showMindMapDialog(mindMapUuid);
}
