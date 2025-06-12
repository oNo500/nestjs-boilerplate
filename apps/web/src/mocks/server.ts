import { createMiddleware } from '@mswjs/http-middleware';
import cors from 'cors';
import express, { json } from 'express';
import logger from 'pino-http';

import { handlers } from './handlers';

const app = express();

app.use(
  cors({
    origin: `http://localhost:3000`,
    credentials: true,
  }),
);

app.use(json());
app.use(
  logger({
    level: 'info',
    redact: ['req.headers', 'res.headers'],
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: true,
      },
    },
  }),
);
app.use(createMiddleware(...handlers));
const port = 9090;
app.listen(port, () => {
  console.log(`Mock API server started at http://localhost:${port}`);
});
