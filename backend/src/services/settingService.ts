import prisma from '../db/client';

export const getSettings = async () => {
  let settings = await prisma.setting.findUnique({
    where: { id: 'default' }
  });

  if (!settings) {
    settings = await prisma.setting.create({
      data: {
        id: 'default'
      }
    });
  }
  return settings;
};

export const updateSettings = async (data: any) => {
  return await prisma.setting.update({
    where: { id: 'default' },
    data
  });
};
