import express from 'express';
import { BAD_REQ_RESPONSE } from '../constants';
import ApplicationPrismaClient from '../utils/db';
import { findUserFromUid } from '../utils/users';
import { saveMessage } from '../utils/messages';

export const router = express.Router();

router.get('/:chatId', async (req, res) => {
  if (!req.params.chatId) return res.status(400).send(BAD_REQ_RESPONSE);

  const messages = await ApplicationPrismaClient.message.findMany({
    where: {
      chatId: req.params.chatId,
    },
  });

  interface StringToStringMap {
    [key: string]: string;
  }
  let participantsIdToEmailMap: StringToStringMap = {};
  let participantsIdToPictureMap: StringToStringMap = {};

  let transformedMessages = [] as any[];
  for (let message of messages) {
    let user = await findUserFromUid(message.senderId);
    if (!participantsIdToEmailMap.hasOwnProperty(message.senderId)) {
      participantsIdToEmailMap[message.senderId] = user?.email as string;
    }
    if (!participantsIdToPictureMap.hasOwnProperty(message.senderId)) {
      participantsIdToPictureMap[message.senderId] = user?.pictureUrl as string;
    }

    transformedMessages.push({
      chatId: message.chatId,
      sender: {
        uid: message.senderId,
        email: participantsIdToEmailMap[message.senderId],
        picture: participantsIdToPictureMap[message.senderId],
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

  let message = saveMessage(
    req.params.chatId,
    req.body.senderId,
    req.body.text,
    new Date()
  );

  res.json(message);
});
