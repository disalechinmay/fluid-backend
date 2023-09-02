import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { auth } from 'express-oauth2-jwt-bearer';
import { BAD_REQ_RESPONSE, FATAL_RESPONSE } from './constants';
import { router as userRouter } from './routes/users';
import { router as messageRouter } from './routes/messages';
import ApplicationPrismaClient from './utils/db';

dotenv.config();
const app = express();
const jwtCheck = auth({
  audience: process.env.AUTH0_AUDIENCE,
  issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
  tokenSigningAlg: process.env.AUTH0_TOKEN_SIGNING_ALG,
});
const port = process.env.EXPRESS_PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(jwtCheck);
app.use((req, res, next) => {
  if (!req?.auth?.payload?.sub) return res.status(400).send(BAD_REQ_RESPONSE);
  next();
});

app.use('/api/users', userRouter);
app.use('/api/messages', messageRouter);

// Error handler
app.use((err: Error, req: Request, res: Response) => {
  console.error(err.stack);
  res.status(500).send(FATAL_RESPONSE + ': ' + err.message);
});

app.listen(port, () => {
  console.log(`Server is running at ${port}`);
});

process.on('SIGINT', () => {
  ApplicationPrismaClient.$disconnect().then(() => {
    console.log('Prisma client disconnected');
    process.exit();
  });
});

export default app;
