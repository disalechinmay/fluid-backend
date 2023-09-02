import express from 'express';
import { BAD_REQ_RESPONSE } from '../constants';
import ApplicationPrismaClient from '../utils/db';
import { findEmailFromUid } from '../utils/users';

export const router = express.Router();

router.get('/:chatId', async (req, res) => {
  if (!req.params.chatId) return res.status(400).send(BAD_REQ_RESPONSE);

  const messages = await ApplicationPrismaClient.message.findMany({
    where: {
      chatId: req.params.chatId,
    },
  });

  interface ParticipantsIdToEmailMap {
    [key: string]: string;
  }
  let participantsIdToEmailMap: ParticipantsIdToEmailMap = {};

  let transformedMessages = [] as any[];
  for (let message of messages) {
    if (!participantsIdToEmailMap.hasOwnProperty(message.senderId)) {
      participantsIdToEmailMap[message.senderId] = (await findEmailFromUid(
        message.senderId
      )) as string;
    }

    transformedMessages.push({
      chatId: message.chatId,
      sender: {
        uid: message.senderId,
        email: participantsIdToEmailMap[message.senderId],
      },
      text: message.text,
      timestamp: message.date as Date,
    });
  }

  res.json(transformedMessages);
});

router.post('/:chatId', async (req, res) => {
  if (!req.params.chatId) return res.status(400).send(BAD_REQ_RESPONSE);
  if (!req.body.senderId || !req.body.text)
    return res.status(400).send(BAD_REQ_RESPONSE);

  const message = await ApplicationPrismaClient.message.create({
    data: {
      chatId: req.params.chatId,
      senderId: req.body.senderId,
      text: req.body.text,
    },
  });

  res.json(message);
});
