import express from 'express';
import { BAD_REQ_RESPONSE } from '../constants';
import ApplicationPrismaClient from '../utils/db';
import { findEmailFromUid } from '../utils/users';

export const router = express.Router();

router.post('/:id', async (req, res) => {
  if (!req.params.id) return res.status(400).send(BAD_REQ_RESPONSE);
  if (!req.body.uid || !req.body.email)
    return res.status(400).send(BAD_REQ_RESPONSE);

  let user = await ApplicationPrismaClient.user.findUnique({
    where: {
      uid: req.params.id,
    },
  });

  if (!user) {
    user = await ApplicationPrismaClient.user.create({
      data: {
        uid: req.body.uid,
        email: req.body.email,
      },
    });
  }

  // Find all chats whose IDs are present in user.chats
  const chats = await ApplicationPrismaClient.chat.findMany({
    where: {
      uid: {
        in: user.chats,
      },
    },
  });

  // Transform chats to include participants' emails
  let transformedChats = [];

  for (let i = 0; i < chats.length; i++) {
    let chat = chats[i];
    let resolvedParticipants = [];
    for (let j = 0; j < chat.participants.length; j++) {
      let p = chat.participants[j] as string;
      resolvedParticipants.push({
        uid: p,
        email: await findEmailFromUid(p as string),
      });
    }
    transformedChats.push({
      uid: chat.uid.toString(),
      participants: resolvedParticipants,
    });
  }

  let transformedUser = {
    ...user,
    chats: transformedChats,
  };

  return res.json(transformedUser);
});

// router.get('/search/:searchQuery', async (req, res) => {
//   if (!req.params.searchQuery) return res.status(400).send(BAD_REQ_RESPONSE);

//   const users = await ApplicationPrismaClient.user.findMany({
//     where: {
//       email: {
//         contains: req.params.searchQuery,
//       },
//     },
//     include: {
//       loansGiven: false,
//       loansTaken: false,
//     },
//     take: 10,
//   });

//   // Remove user if they are the same as the current user
//   const filteredUsers = users.filter(
//     (user) => user.uid !== req?.auth?.payload?.sub?.toString()
//   );
//   return res.json(filteredUsers);
// });
