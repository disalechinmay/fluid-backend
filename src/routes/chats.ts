import express from 'express';
import { BAD_REQ_RESPONSE } from '../constants';
import ApplicationPrismaClient from '../utils/db';

export const router = express.Router();

router.post('/', async (req, res) => {
  console.log('Inside post');
  console.log(req.body);
  if (!req.body.uid) {
    return res.status(400).send(BAD_REQ_RESPONSE);
  }

  // Find all chats whose IDs are present in user.chats
  const chats = await ApplicationPrismaClient.chat.findMany({
    where: {
      participants: {
        has: req?.auth?.payload?.sub as string,
      },
    },
  });

  let shouldCreateNewChat = true;
  let chatId = null;
  for (let i = 0; i < chats.length; i++) {
    let chat = chats[i];
    if (
      chat.participants.length === 2 &&
      chat.participants.includes(req.body.uid)
    ) {
      shouldCreateNewChat = false;
      chatId = chat.uid;
      break;
    }
  }

  if (shouldCreateNewChat) {
    let chat = await ApplicationPrismaClient.chat.create({
      data: {
        participants: {
          set: [req?.auth?.payload?.sub as string, req.body.uid],
        },
      },
    });

    // Add chatId to users
    await ApplicationPrismaClient.user.update({
      where: {
        uid: req?.auth?.payload?.sub as string,
      },
      data: {
        chats: {
          push: chat.uid,
        },
      },
    });

    await ApplicationPrismaClient.user.update({
      where: {
        uid: req.body.uid,
      },
      data: {
        chats: {
          push: chat.uid,
        },
      },
    });

    chatId = chat.uid;
  }

  res.json(chatId?.toString());
});
