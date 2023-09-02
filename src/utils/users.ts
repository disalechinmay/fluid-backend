import ApplicationPrismaClient from './db';

export const findEmailFromUid = async (uid: string) => {
  const user = await ApplicationPrismaClient.user.findUnique({
    where: {
      uid,
    },
  });

  if (!user) return null;
  return user.email;
};
