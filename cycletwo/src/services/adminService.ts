import { prisma } from "../utils/prismaClient.js";

export const getAllCyclesAdmin = async () => {
  return prisma.cycle.findMany({
    include: { shopkeeper: true, ratings: true, bookings: { include: { user: true } } }
  });
};

export const updateCycle = async (id: number, data: any) => {
  return prisma.cycle.update({ where: { id }, data });
};

export const deleteCycleAdmin = async (id: number) => {
  await prisma.shopkeeperRating.deleteMany({ where: { booking: { cycleId: id } } });
  await prisma.cycleRating.deleteMany({ where: { cycleId: id } });
  await prisma.booking.deleteMany({ where: { cycleId: id } });
  return prisma.cycle.delete({ where: { id } });
};

export const getDashboardStats = async () => {
  const [users, shopkeepers, cycles, bookings] = await Promise.all([
    prisma.user.count(),
    prisma.shopkeeper.count(),
    prisma.cycle.count(),
    prisma.booking.count(),
  ]);
  return { users, shopkeepers, cycles, bookings };
};

export const getAllBookingsAdmin = async () => {
  return prisma.booking.findMany({
    include: {
      user: true,
      cycle: { include: { shopkeeper: true } },
      cycleRating: true,
    },
    orderBy: { id: "desc" }
  });
};
