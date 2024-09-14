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
    uploadDocument(body.text);
  });
}

function submitSelected() {
  Office.context.document.getSelectedDataAsync(Office.CoercionType.Text, function (asyncResult) {
    if (asyncResult.status == Office.AsyncResultStatus.Failed) {
      document.getElementById("test-content").innerHTML = asyncResult.error.message;
    } else {
      if (asyncResult.value) {
        uploadDocument(asyncResult.value as string);
      }
    }
  });
}

function navigateWebApp() {
  Office.context.ui.displayDialogAsync("https://mai-mind-map.azurewebsites.net");
}

function uploadDocument(content: string) {
  createDocument()
    .then(response => {
      const docId = response.doc_id;
      console.log("New doc created: ", docId);
      return updateContent(docId, content);
    })
    .then(success => {
      navigateWebApp();
    })
    .catch(error => {
      console.error("Error: ", error);
    })
}

function createDocument() {
  return new Promise((resolve, reject) => {
    const url = "https://mai-mind-map.azurewebsites.net/api/new";
    const name = docName();
    const data = { name };

    const request = new XMLHttpRequest();
    request.onreadystatechange = function () {
      if (request.readyState === 4) {
        if (request.status === 200) {
          resolve(JSON.parse(request.responseText));
        } else {
          reject(request.statusText);
        }
      }
    };

    request.open("POST", url, true);
    request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    request.send(JSON.stringify(data));
  });
}

function updateContent(docId: string, content: string) {
  return new Promise((resolve, reject) => {
    const url = `https://mai-mind-map.azurewebsites.net/api/update/${docId}`;
    const data = { content };

    const request = new XMLHttpRequest();
    request.onreadystatechange = function () {
      if (request.readyState === 4) {
        if (request.status === 200) {
          resolve(JSON.parse(request.responseText));
        } else {
          reject(request.statusText);
        }
      }
    };

    request.open("PATCH", url, true);
    request.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
    request.send(JSON.stringify(data));
  });
}

function docName() {
  return `word_${Math.round((Math.random() + 1) * Date.now()).toString(36)}`
}