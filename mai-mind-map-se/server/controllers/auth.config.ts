import {Configuration,  LogLevel } from '@azure/msal-node';
import { readConfig } from "../utils";

const config = readConfig();
export const msalConfig: Configuration = {
  auth: {
    clientId: config.CLIENT_ID,
    authority: config.CLOUD_INSTANCE + 'common',
    clientSecret: config.CLIENT_SECRET
  },
  system: {
    loggerOptions: {
      loggerCallback(loglevel: LogLevel, message: string, containsPii: boolean) {
        console.log(message);
      },
      piiLoggingEnabled: false,
      logLevel: 3,
    }
  }
}

export const REDIRECT_URI = config.REDIRECT_URI;
export const POST_LOGOUT_REDIRECT_URI = config.POST_LOGOUT_REDIRECT_URI;
export const GRAPH_ME_ENDPOINT = config.GRAPH_API_ENDPOINT + "v1.0/me";
