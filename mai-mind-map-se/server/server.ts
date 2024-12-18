import path from 'node:path';
import cors from 'cors';
import express, {
  type Request,
  type Response,
  type Application,
  type NextFunction,
} from 'express';
import session from 'express-session';
import {router as userRouter} from './controllers/users'
import {docsRouter} from './controllers/docs'
import {router as authRouter} from './controllers/auth'

declare module 'express-session' {
  interface SessionData {
    isAuthenticated: boolean;
    account: { name: string; username: string };
  }
}
import cookieParser from 'cookie-parser';
import { readConfig } from './utils';
import { isAuthenticated } from './controllers/users';

function normalizePort(val: string): number {
  const port = Number.parseInt(val, 10);

  if (Number.isNaN(port)) {
    // named pipe
    return 3000;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return 3000;
}

export function run() {
  const app: Application = express();
  const port = normalizePort(process.env.PORT || '3000');
  app.use(cors());
  app.use(session({
    secret: readConfig().EXPRESS_SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false,
    }
  }));
  app.use(express.json());
  app.use(cookieParser());
  app.use(express.urlencoded({ extended: false }));

  app.get('/', (req: Request, res: Response) => {
    res.sendFile(path.resolve(__dirname, '../dist/index.html'));
  });
  app.get('/edit', isAuthenticated, (req: Request, res: Response) => {
    res.sendFile(path.resolve(__dirname, '../dist/index.html'));
  });
  app.get('/edit/:id', isAuthenticated, (req: Request, res: Response) => {
    res.sendFile(path.resolve(__dirname, '../dist/index.html'));
  });
  app.get('/favicon.ico', (req: Request, res: Response) => {
    res.sendFile(path.resolve(__dirname, '../dist/favicon.ico'));
  });
  app.use('/static', express.static(path.resolve(__dirname, '../dist/static')));

  app.use(express.raw({ type: '*/*', limit: '10mb' }));
  app.use('/api', docsRouter);
  app.use('/users', userRouter);
  app.use('/auth', authRouter);
  app.use('/cookie/unrestrict', (req: Request, res: Response) => {
    res.cookie('connect.sid', req.cookies['connect.sid'], { httpOnly: true, secure: true, path:'/', sameSite: 'none' });
    res.send({});
  });

  app.use('/addin', express.static(path.resolve(__dirname, '../dist/addin')));

  app.listen(port, () => {
    console.log(`Server is Fire at http://localhost:${port}`);
  });
}
