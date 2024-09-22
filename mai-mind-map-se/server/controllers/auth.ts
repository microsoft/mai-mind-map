import express from 'express';
import { authProvider } from './auth.provider';
import { REDIRECT_URI, POST_LOGOUT_REDIRECT_URI } from './auth.config';

const router = express.Router();

router.get('/signin', authProvider.login({
  scopes: [],
  redirectUri: REDIRECT_URI,
  successRedirect: '/'
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

module.exports = router;
