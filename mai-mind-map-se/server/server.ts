import path from 'node:path';
import express, {
  type Request,
  type Response,
  type Application,
} from 'express';

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

  app.get('/', (req: Request, res: Response) => {
    res.sendFile(path.resolve(__dirname, '../dist/index.html'));
  });
  app.get('/favicon.ico', (req: Request, res: Response) => {
    res.sendFile(path.resolve(__dirname, '../dist/favicon.ico'));
  });
  app.use('/static', express.static(path.resolve(__dirname, '../dist/static')));

  app.use(express.raw({ type: '*/*', limit: '10mb' }));
  app.use('/api/', require('./controllers/docs'));

  app.use('/addin', express.static(path.resolve(__dirname, '../dist/addin')));

  app.listen(port, () => {
    console.log(`Server is Fire at http://localhost:${port}`);
  });
}
