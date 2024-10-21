/*
 * Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
 * See LICENSE in the project root for license information.
 */

interface UserProfileResponse {
  id: string;
  name: string;
  email: string;
}

let instance: SignInHelper | null = null;

Office.initialize = async function () {
  try {
    const profile = await SignInHelper.getInstance().checkUserProfile();
    if (!profile || !profile.id) {
      await SignInHelper.getInstance().showSignInDialog();
    }
  } catch (e) {
    await SignInHelper.getInstance().showSignInDialog();
    console.error(e);
  }
};

export class SignInHelper {
  private static USER_PROFILE_API = new URL("https://dev-mai-mind-map.azurewebsites.net/users/profile");
  private static SIGN_OUT_API = new URL("https://dev-mai-mind-map.azurewebsites.net/auth/signout");

  private dialog: Office.Dialog;
  private observers = [];

  static initializeInstance(): void {
    instance = new SignInHelper();
  }

  static getInstance(): SignInHelper {
    if (!instance) {
      throw new Error("SignInHelper not initialized");
    }
    return instance;
  }

  private processDialogMesssage(data) {
    const messageFromDialog = JSON.parse(data.message);
    const success = messageFromDialog.success;
    if (success) {
      this.dialog.close();
    }
    for (const observer of this.observers) {
      observer(success);
    }
  }

  async showSignInDialog() {
    Office.context.ui.displayDialogAsync(
      `https://dev-mai-mind-map.azurewebsites.net/auth/signin`,
      { height: 500, width: 500 },
      (asyncResult) => {
        this.dialog = asyncResult.value;
        this.dialog.addEventHandler(Office.EventType.DialogMessageReceived, this.processDialogMesssage);
      }
    );
  }

  async signOut() {
    const headers = new Headers();
    headers.set("Content-Type", "application/json");

    const response = await fetch(SignInHelper.SIGN_OUT_API, {
      headers,
      method: "GET",
    });

    const responseBody = await response.json();

    if (response.ok && responseBody.id) {
      return responseBody;
    } else {
      throw new Error(
        `API call failed. HTTP status: ${response.status}. Response from server: ${JSON.stringify(responseBody)}`
      );
    }
  }

  async checkUserProfile(): Promise<UserProfileResponse> {
    const headers = new Headers();
    headers.set("Content-Type", "application/json");

    const response = await fetch(SignInHelper.USER_PROFILE_API, {
      headers,
      method: "GET",
    });

    const responseBody = await response.json();

    if (response.ok && responseBody.id) {
      return responseBody;
    } else {
      throw new Error(
        `API call failed. HTTP status: ${response.status}. Response from server: ${JSON.stringify(responseBody)}`
      );
    }
  }

  observeSignIn(observer: (success: boolean) => void) {
    this.observers.push(observer);
  }

  unobserveSignIn(observer: (success: boolean) => void) {
    const index = this.observers.indexOf(observer);
    if (index > -1) {
      this.observers.splice(index, 1);
    }
  }
}

SignInHelper.initializeInstance();
