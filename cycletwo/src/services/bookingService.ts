import { prisma } from "../utils/prismaClient.js";
import { notifyBookingMade, notifyBookingCancelled } from "./notificationService.js";

const calcAmount = (start: Date, end: Date, pricePerHour: number) => {
  const ms = end.getTime() - start.getTime();
  const hours = ms / 3600000;
  return Math.round(hours * pricePerHour * 100) / 100;
};

export const createBooking = async (userId: number, cycleId: number, startTime: string, endTime: string) => {
  const cycle = await prisma.cycle.findUnique({ where: { id: cycleId } });
  if (!cycle || !cycle.available) throw new Error("Cycle not available");

  const start = new Date(startTime);
  const end = new Date(endTime);
  const totalAmount = calcAmount(start, end, cycle.price);

  const booking = await prisma.booking.create({
    data: { userId, cycleId, startTime: start, endTime: end, status: "confirmed", totalAmount, bookedAt: new Date() },
    include: { user: true, cycle: { include: { shopkeeper: true } } }
  });

  await prisma.cycle.update({ where: { id: cycleId }, data: { available: false } });
  await notifyBookingMade(booking);

  return booking;
};

export const getUserBookings = async (userId: number) => {
  return prisma.booking.findMany({
    where: { userId },
    include: {
      cycle: { include: { shopkeeper: true, ratings: true } },
      cycleRating: true,
      shopkeeperRating: true,
      user: true,
    },
    orderBy: { id: "desc" }
  });
};

export const getShopkeeperBookings = async (shopkeeperId: number) => {
  return prisma.booking.findMany({
    where: { cycle: { shopkeeperId } },
    include: {
      cycle: true,
      user: true,
      cycleRating: true,
    },
    orderBy: { id: "desc" }
  });
};

export const cancelBooking = async (bookingId: number, userId: number) => {
  const booking = await prisma.booking.findUnique({ where: { id: bookingId }, include: { cycle: true } });
  if (!booking) throw new Error("Booking not found");
  if (booking.userId !== userId) throw new Error("Not your booking");

  const minutesSinceBooked = (Date.now() - new Date(booking.bookedAt).getTime()) / 60000;
  if (minutesSinceBooked > 10) throw new Error("Cannot cancel after 10 minutes of booking");

  const updated = await prisma.booking.update({ where: { id: bookingId }, data: { status: "cancelled" } });
  await prisma.cycle.update({ where: { id: booking.cycleId }, data: { available: true } });
  await notifyBookingCancelled(booking);

  return updated;
};

export const markDelivered = async (bookingId: number, shopkeeperId: number) => {
  const booking = await prisma.booking.findUnique({ where: { id: bookingId }, include: { cycle: true } });
  if (!booking) throw new Error("Booking not found");
  if (booking.cycle.shopkeeperId !== shopkeeperId) throw new Error("Not your cycle");

  return prisma.booking.update({
    where: { id: bookingId },
    data: { status: "active", deliveredAt: new Date() }
  });
};

export const completeBooking = async (bookingId: number) => {
  const booking = await prisma.booking.update({
    where: { id: bookingId },
    data: { status: "completed" }
  });
  await prisma.cycle.update({ where: { id: booking.cycleId }, data: { available: true } });
  return booking;
};
