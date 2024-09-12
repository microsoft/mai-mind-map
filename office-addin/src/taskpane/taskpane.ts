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
    document.getElementById("test-content").innerHTML = body.text;
    navigateWebApp();
  });
}

function submitSelected() {
  Office.context.document.getSelectedDataAsync(Office.CoercionType.Text, function (asyncResult) {
    if (asyncResult.status == Office.AsyncResultStatus.Failed) {
      document.getElementById("test-content").innerHTML = asyncResult.error.message;
    } else {
      if (asyncResult.value) {
        document.getElementById("test-content").innerHTML = asyncResult.value as string;
        navigateWebApp();
      }
    }
  });
}

function navigateWebApp() {
  Office.context.ui.displayDialogAsync("https://mai-mind-map.azurewebsites.net");
}
