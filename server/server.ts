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
    res.send('Welcome to Express & TypeScript Server');
  });

  app.listen(port, () => {
    //console.log(`Server is Fire at http://localhost:${port}`);
  });
}
