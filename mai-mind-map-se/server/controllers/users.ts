import express, { Request, Response, NextFunction } from 'express';
import { Session } from 'express-session';
const router = express.Router();

import { createLoopDocument } from '../loop';

interface CustomSession extends Session {
  account?: {
    idTokenClaims?: any;
    name: string;
    username: string;
  };
  isAuthenticated?: boolean;
  accessToken?: string;
}

export function isAuthenticated(req: Request, res: Response, next: NextFunction): void {
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

router.get('/profile', isAuthenticated,
  async function (req, res) {
    res.send({
      name: (req.session as CustomSession).account?.name,
      email: (req.session as CustomSession).account?.username,
    });
  }
);

module.exports = router;
