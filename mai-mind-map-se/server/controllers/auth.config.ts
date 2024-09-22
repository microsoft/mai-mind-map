import { readConfig } from "../utils";
import msal, { LogLevel } from '@azure/msal-node';

const config = readConfig();
export const msalConfig: msal.Configuration = {
  auth: {
    clientId: config.CLIENT_ID,
    authority: config.CLOUD_INSTANCE + config.TENANT_ID,
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
