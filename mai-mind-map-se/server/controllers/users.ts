import express, { Request, Response, NextFunction } from 'express';
import { Session } from 'express-session';
import { createLoopDocument } from '../loop';
import { GetUserByLocalAccountID } from '../storage/users';
import { handleError, PERMISSION_DENIED } from '../utils';
import { getUID } from '../storage/users';
export const router = express.Router();

export interface CustomSession extends Session {
  account?: {
    idTokenClaims?: any;
    localAccountId: string;
    name: string;
    username: string;
  };
  isAuthenticated?: boolean;
  accessToken?: string;
}

export function isAuthenticated(req: Request, res: Response, next: NextFunction): void {
  if (!(req.session as CustomSession)?.isAuthenticated) {
    return res.redirect( `/auth/signin?targetUrl=${encodeURIComponent(req.originalUrl)}`);
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
  async function (req, res) {
    const uid = await getUID(req);
    if (uid === undefined) {
      res.status(401).send({ message: PERMISSION_DENIED });
      return;
    }
    try {
      const result = await GetUserByLocalAccountID(
        (req.session as CustomSession).account?.localAccountId!)
      res.send({
        uid: result.rows[0].id,
        name: (req.session as CustomSession).account?.name,
        email: (req.session as CustomSession).account?.username,
      });
    } catch (err: unknown) {
      res.send({ message: handleError(err) });
    }
  }
);
