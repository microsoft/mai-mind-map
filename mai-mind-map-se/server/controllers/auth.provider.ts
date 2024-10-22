import { Request, Response } from 'express';
import * as msal from '@azure/msal-node';
import axios from 'axios';
import { msalConfig, POST_LOGOUT_REDIRECT_URI } from './auth.config';
import { AddUser, GetUserByLocalAccountID } from '../storage/users';

interface AuthProviderOptions {
  scopes?: string[];
  redirectUri?: string;
  successRedirect?: string;
  postLogoutRedirectUri?: string;
}

interface AuthCodeUrlRequestParams {
  state: string;
  scopes: string[];
  redirectUri: string;
}

interface AuthCodeRequestParams {
  state: string;
  scopes: string[];
  redirectUri: string;
}

export class AuthProvider {
  msalConfig: msal.Configuration;
  cryptoProvider: msal.CryptoProvider;

  constructor(msalConfig: msal.Configuration) {
    this.msalConfig = msalConfig;
    this.cryptoProvider = new msal.CryptoProvider();
  }

  login(options: AuthProviderOptions = {}) {
    return async (req: Request, res: Response, next: any) => {
      let targetUrl = req.query['targetUrl'] as string;
      if (targetUrl) {
        targetUrl = decodeURIComponent(targetUrl);
      }
      const state = this.cryptoProvider.base64Encode(
        JSON.stringify({
          successRedirect: targetUrl || options.successRedirect || '/',
        })
      );

      const authCodeUrlRequestParams: AuthCodeUrlRequestParams = {
        state: state,
        scopes: options.scopes || [],
        redirectUri: options.redirectUri!,
      };

      const authCodeRequestParams: AuthCodeRequestParams = {
        state: state,
        scopes: options.scopes || [],
        redirectUri: options.redirectUri!,
      };

      if (!this.msalConfig.auth.cloudDiscoveryMetadata || !this.msalConfig.auth.authorityMetadata) {
        const [cloudDiscoveryMetadata, authorityMetadata] = await Promise.all([
          this.getCloudDiscoveryMetadata(this.msalConfig.auth.authority!),
          this.getAuthorityMetadata(this.msalConfig.auth.authority!)
        ]);

        this.msalConfig.auth.cloudDiscoveryMetadata = JSON.stringify(cloudDiscoveryMetadata);
        this.msalConfig.auth.authorityMetadata = JSON.stringify(authorityMetadata);
      }

      const msalInstance = this.getMsalInstance(this.msalConfig);

      return this.redirectToAuthCodeUrl(
        authCodeUrlRequestParams,
        authCodeRequestParams,
        msalInstance
      )(req, res, next);
    };
  }

  acquireToken(options: AuthProviderOptions = {}) {
    return async (req: any, res: any, next: any) => {
      try {
        const msalInstance = this.getMsalInstance(this.msalConfig);

        if (req.session.tokenCache) {
          msalInstance.getTokenCache().deserialize(req.session.tokenCache);
        }

        const tokenResponse = await msalInstance.acquireTokenSilent({
          account: req.session.account,
          scopes: options.scopes || [],
        });

        req.session.tokenCache = msalInstance.getTokenCache().serialize();
        req.session.accessToken = tokenResponse.accessToken;
        req.session.idToken = tokenResponse.idToken;
        req.session.account = tokenResponse.account;

        res.redirect(options.successRedirect);
      } catch (error) {
        if (error instanceof msal.InteractionRequiredAuthError) {
          return this.login({
            scopes: options.scopes || [],
            redirectUri: options.redirectUri,
            successRedirect: options.successRedirect || '/',
          })(req, res, next);
        }

        next(error);
      }
    };
  }

  handleRedirect(options: AuthProviderOptions = {}) {
    return async (req: any, res: any, next: any) => {
      if (!req.body || !req.body.state) {
        return next(new Error('Error: response not found'));
      }

      const authCodeRequest: msal.AuthorizationCodeRequest = {
        ...req.session.authCodeRequest,
        code: req.body.code,
        codeVerifier: req.session.pkceCodes.verifier,
      };

      try {
        const msalInstance = this.getMsalInstance(this.msalConfig);

        if (req.session.tokenCache) {
          msalInstance.getTokenCache().deserialize(req.session.tokenCache);
        }

        const tokenResponse = await msalInstance.acquireTokenByCode(authCodeRequest, req.body);

        req.session.tokenCache = msalInstance.getTokenCache().serialize();
        req.session.idToken = tokenResponse.idToken;
        req.session.account = tokenResponse.account;
        req.session.isAuthenticated = true;

        const state = JSON.parse(this.cryptoProvider.base64Decode(req.body.state));
        await RegisterUser(req.session.account);
        res.cookie('connect.sid',req.cookies['connect.sid'], {httpOnly: true, secure: false, sameSite: 'none'});
        res.redirect(state.successRedirect);
      } catch (error) {
        next(error);
      }
    }
  }

  logout(options: AuthProviderOptions = {}) {
    return (req: any, res: any, next: any) => {
      let logoutUri = `${this.msalConfig.auth.authority}/oauth2/v2.0/`;

      if (options.postLogoutRedirectUri) {
        logoutUri += `logout?post_logout_redirect_uri=${options.postLogoutRedirectUri}`;
      }

      req.session.destroy(() => {
        res.redirect(POST_LOGOUT_REDIRECT_URI);
      });
    }
  }

  getMsalInstance(msalConfig: msal.Configuration): msal.ConfidentialClientApplication {
    return new msal.ConfidentialClientApplication(msalConfig);
  }

  redirectToAuthCodeUrl(authCodeUrlRequestParams: AuthCodeUrlRequestParams, authCodeRequestParams: AuthCodeRequestParams, msalInstance: msal.ConfidentialClientApplication) {
    return async (req: any, res: any, next: any) => {
      const { verifier, challenge } = await this.cryptoProvider.generatePkceCodes();

      req.session.pkceCodes = {
        challengeMethod: 'S256',
        verifier: verifier,
        challenge: challenge,
      };

      req.session.authCodeUrlRequest = {
        ...authCodeUrlRequestParams,
        responseMode: msal.ResponseMode.FORM_POST,
        codeChallenge: req.session.pkceCodes.challenge,
        codeChallengeMethod: req.session.pkceCodes.challengeMethod,
      };

      req.session.authCodeRequest = {
        ...authCodeRequestParams,
        code: '',
      };

      try {
        const authCodeUrlResponse = await msalInstance.getAuthCodeUrl(req.session.authCodeUrlRequest);
        res.redirect(authCodeUrlResponse);
      } catch (error) {
        next(error);
      }
    };
  }

  async getCloudDiscoveryMetadata(authority: string): Promise<any> {
    const endpoint = 'https://login.microsoftonline.com/common/discovery/instance';

    try {
      const response = await axios.get(endpoint, {
        params: {
          'api-version': '1.1',
          'authorization_endpoint': `${authority}/oauth2/v2.0/authorize`
        }
      });

      return await response.data;
    } catch (error) {
      throw error;
    }
  }

  async getAuthorityMetadata(authority: string): Promise<any> {
    const endpoint = `${authority}/v2.0/.well-known/openid-configuration`;

    try {
      const response = await axios.get(endpoint);
      return await response.data;
    } catch (error) {
      console.log(error);
    }
  }
}

/**
 * Registers a new user if the user does not already exist.
 *
 * @param account - The account information of the user to be registered.
 * @returns A promise that resolves when the user is successfully registered or
 * if the user already exists.
 * @throws Will throw an error if the user registration fails.
 */
export async function RegisterUser(account: any) {
  const { rows } = await GetUserByLocalAccountID(account.localAccountId);
  if (rows.length != 0) {
    return;
  }
  // Register user
  const user = await (AddUser(account));
  if (user.rows.affectedRows != 1) {
    throw new Error('Failed to register user');
  }
}

export const authProvider = new AuthProvider(msalConfig);
