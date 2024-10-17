import express from 'express';
import { POST_LOGOUT_REDIRECT_URI, REDIRECT_URI } from './auth.config';
import { authProvider } from './auth.provider';

export const router = express.Router();

router.get('/signin', authProvider.login({
  scopes: [],
  redirectUri: REDIRECT_URI,
}));

router.get('/acquireToken', authProvider.acquireToken({
  scopes: ['User.Read'],
  redirectUri: REDIRECT_URI,
  successRedirect: '/users/id'
}));

router.post('/redirect', authProvider.handleRedirect());

router.get('/signout', authProvider.logout({
  postLogoutRedirectUri: POST_LOGOUT_REDIRECT_URI
}));
