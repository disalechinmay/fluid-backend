import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { auth } from 'express-oauth2-jwt-bearer';
import { BAD_REQ_RESPONSE, FATAL_RESPONSE } from './constants';
import { router as userRouter } from './routes/users';
import { router as messageRouter } from './routes/messages';
import { router as chatRouter } from './routes/chats';
import ApplicationPrismaClient from './utils/db';
import { verify as verifyJWT } from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import { socketHandler } from './routes/sockets';
import { Server as SocketIOServer } from 'socket.io';

dotenv.config();
const app = express();
const server = require('http').createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});
const jwtCheck = auth({
  audience: process.env.AUTH0_AUDIENCE,
  issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
  tokenSigningAlg: process.env.AUTH0_TOKEN_SIGNING_ALG,
});
const jwksClientInstance = jwksClient({
  jwksUri: process.env.AUTH0_JWKS_URI as string,
});
function getKey(header: any, callback: any) {
  jwksClientInstance.getSigningKey(header.kid, function (err, key) {
    if (key) {
      var signingKey = key.getPublicKey();
      callback(null, signingKey);
    }
  });
}
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
app.use('/api/chats', chatRouter);

// Error handler
app.use((err: Error, req: Request, res: Response) => {
  console.error(err.stack);
  res.status(500).send(FATAL_RESPONSE + ': ' + err.message);
});

io.use((socket: any, next: any) => {
  const token = socket.handshake.auth.token;
  verifyJWT(
    token,
    getKey,
    { algorithms: ['RS256'] },
    (err: any, decoded: any) => {
      if (err) return next(new Error('Authentication error'));
      socket.decoded = decoded;
      next();
    }
  );
});

io.on('connection', (socket) => {
  socketHandler(socket, io);
});

server.listen(port, () => {
  console.log(`Server is running at ${port}`);
});

process.on('SIGINT', () => {
  ApplicationPrismaClient.$disconnect().then(() => {
    console.log('Prisma client disconnected');
    process.exit();
  });
});

export default app;
