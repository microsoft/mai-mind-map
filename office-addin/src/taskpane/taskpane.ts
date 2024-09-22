/*
 * Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
 * See LICENSE in the project root for license information.
 */

/* global document, Office, Word */

Office.onReady((info) => {
  if (info.host === Office.HostType.Word) {
    document.getElementById("btn-submit-all").onclick = submitAll;
    document.getElementById("btn-submit-selected").onclick = submitSelected;
  }
});

function submitAll() {
  Word.run(async (context) => {
    const body: Word.Body = context.document.body;
    body.load("text");
    await context.sync();
    await uploadDocument(body.text);
  });
}

function submitSelected() {
  Office.context.document.getSelectedDataAsync(Office.CoercionType.Text, async function (asyncResult) {
    if (asyncResult.status == Office.AsyncResultStatus.Failed) {
      document.getElementById("test-content").innerHTML = asyncResult.error.message;
    } else {
      if (asyncResult.value) {
        await uploadDocument(asyncResult.value as string);
      }
    }
  });
}

function navigateWebApp(docId: string) {
  Office.context.ui.displayDialogAsync(`https://mai-mind-map.azurewebsites.net?docId=${docId}`);
}

async function uploadDocument(content: string) {
  try {
    const { id } = await createDocument();
    await updateContent(id, content);
    navigateWebApp(id);
  } catch (e) {
    console.error("Error: ", e);
  }
}

async function createDocument() {
  const url = "https://mai-mind-map.azurewebsites.net/api/new";
  const name = docName();
  const data = {name};

  const headers = new Headers();
  headers.set("Content-Type", "application/json;charset=UTF-8");

  const response = await fetch(url, { method: "POST", headers, body: JSON.stringify(data) });
  if (response.ok) {
    return response.json();
  } else {
    throw new Error(response.statusText);
  }
}

async function updateContent(docId: string, content: string) {
  const url = `https://mai-mind-map.azurewebsites.net/api/update/${docId}`;
  const data = {content};

  const headers = new Headers();
  headers.set("Content-Type", "application/json;charset=UTF-8");

  const response = await fetch(url, {method: "PATCH", headers, body: JSON.stringify(data)});
  if (response.ok) {
    return response.json();
  } else {
    throw new Error(response.statusText);
  }
}

function docName() {
  return `word_${Math.round((Math.random() + 1) * Date.now()).toString(36)}`;
}
