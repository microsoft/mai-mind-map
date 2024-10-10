import express, { Request, Response, NextFunction } from 'express';
import { Session } from 'express-session';
const router = express.Router();

import { createLoopDocument } from '../loop';
import { fetch } from '../utils';
import { GRAPH_ME_ENDPOINT } from './auth.config';

interface CustomSession extends Session {
  account?: {
    idTokenClaims?: any;
  };
  isAuthenticated?: boolean;
  accessToken?: string;
}

function isAuthenticated(req: Request, res: Response, next: NextFunction): void {
  if (!(req.session as CustomSession)?.isAuthenticated) {
    return res.redirect('/auth/signin');
  }
  next();
}


router.get('/id',
  isAuthenticated,
  async function (req: Request, res: Response, next: NextFunction) {
    const accessToken: string = (req.session as CustomSession)?.accessToken!;
    createLoopDocument(accessToken);
    res.send({});
  }
);

router.get('/profile',
  isAuthenticated,
  async function (req: Request, res: Response, next: NextFunction) {
    try {
      const accessToken: string = (req.session as CustomSession)?.accessToken!;
      const graphResponse = await fetch(GRAPH_ME_ENDPOINT, accessToken);
      res.send({ profile: graphResponse });
    } catch (error: unknown) {
      next(error);
    }
  }
);

module.exports = router;
