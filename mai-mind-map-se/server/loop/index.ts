import { OnBehalfOfCredential } from '@azure/identity';
import { Client } from '@microsoft/microsoft-graph-client';
import 'isomorphic-fetch';
import { readConfig } from '../utils';

const config = readConfig();

export const createLoopDocument = async (accessToken: string) => {
  try {
    const oboCredential = new OnBehalfOfCredential({
      tenantId: config.TENANT_ID,
      clientId: config.CLIENT_ID,
      clientSecret: config.CLIENT_SECRET,
      userAssertionToken: accessToken,
    });

    const client = Client.initWithMiddleware({
      authProvider: {
        getAccessToken: async () => {
          const tokenResponse = await oboCredential.getToken(['Files.ReadWrite.All']);
          return tokenResponse.token;
        }
      }
    });

    const loopDoc = {
      name: 'New Loop Document',
      file: {
        '@microsoft.graph.conflictBehavior': 'rename',
        content: 'Your Loop document content here'
      }
    };

    const response = await client.api('/me/drive/root/children').post(loopDoc);

    console.log("Loop Document Uploaded to OneDrive:", response);

  } catch (error) {
    console.error("Error creating Loop document in OneDrive:", error);
  }
};
