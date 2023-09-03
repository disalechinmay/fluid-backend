import ApplicationPrismaClient from './db';

export const saveMessage = async (
  chatId: string,
  senderId: string,
  text: string,
  timestamp: Date
) => {
  const message = await ApplicationPrismaClient.message.create({
    data: {
      chatId: chatId,
      senderId: senderId,
      text: text,
      date: timestamp || new Date(),
    },
  });
  return message;
};
