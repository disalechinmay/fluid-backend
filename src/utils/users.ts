import ApplicationPrismaClient from './db';

export const findUserFromUid = async (uid: string) => {
  const user = await ApplicationPrismaClient.user.findUnique({
    where: {
      uid,
    },
    select: {
      uid: true,
      email: true,
      pictureUrl: true,
    },
  });

  if (!user) return null;
  return user;
};
