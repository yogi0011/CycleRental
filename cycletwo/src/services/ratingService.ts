import { prisma } from "../utils/prismaClient.js";

export const rateCycle = async (userId: number, bookingId: number, cycleId: number, rating: number, comment: string) => {
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking || booking.userId !== userId) throw new Error("Invalid booking");
  if (booking.status !== "confirmed" && booking.status !== "completed") throw new Error("Can only rate completed bookings");
  const existing = await prisma.cycleRating.findUnique({ where: { bookingId } });
  if (existing) throw new Error("Already rated this booking");
  return prisma.cycleRating.create({ data: { rating, comment, bookingId, cycleId, userId } });
};

export const rateShopkeeper = async (userId: number, bookingId: number, shopkeeperId: number, rating: number, comment: string) => {
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking || booking.userId !== userId) throw new Error("Invalid booking");
  const existing = await prisma.shopkeeperRating.findUnique({ where: { bookingId } });
  if (existing) throw new Error("Already rated this shopkeeper for booking");
  return prisma.shopkeeperRating.create({ data: { rating, comment, bookingId, shopkeeperId, userId } });
};

export const getCycleRatings = async (cycleId: number) => {
  return prisma.cycleRating.findMany({ where: { cycleId }, orderBy: { id: "desc" } });
};

export const getAvgCycleRating = async (cycleId: number) => {
  const result = await prisma.cycleRating.aggregate({ where: { cycleId }, _avg: { rating: true }, _count: true });
  return { avg: result._avg.rating ?? 0, count: result._count };
};
