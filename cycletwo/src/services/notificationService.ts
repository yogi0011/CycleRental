import { prisma } from "../utils/prismaClient.js";
import { emitToUser, emitToShopkeeper, emitToAdmins } from "../utils/socket.js";

export const createAndEmit = async (data: {
  message: string;
  type: string;
  bookingId?: number;
  userId?: number;
  shopkeeperId?: number;
  adminId?: number;
}) => {
  const notif = await prisma.notification.create({ data });

  if (data.userId) emitToUser(data.userId, "notification", notif);
  if (data.shopkeeperId) emitToShopkeeper(data.shopkeeperId, "notification", notif);
  if (data.adminId) emitToAdmins("notification", notif);

  return notif;
};

export const notifyBookingMade = async (booking: any) => {
  const cycle = await prisma.cycle.findUnique({ where: { id: booking.cycleId }, include: { shopkeeper: true } });
  const user = await prisma.user.findUnique({ where: { id: booking.userId } });
  if (!cycle || !user) return;

  // Notify shopkeeper
  await createAndEmit({
    message: `New booking! ${user.name} booked "${cycle.model}". Booking #${booking.id}`,
    type: "booking_new",
    bookingId: booking.id,
    shopkeeperId: cycle.shopkeeperId,
  });

  // Notify all admins
  const admins = await prisma.admin.findMany();
  for (const admin of admins) {
    await createAndEmit({
      message: `Booking #${booking.id}: ${user.name} booked "${cycle.model}" from ${cycle.shopkeeper.name}`,
      type: "booking_new",
      bookingId: booking.id,
      adminId: admin.id,
    });
  }
};

export const notifyBookingCancelled = async (booking: any) => {
  const cycle = await prisma.cycle.findUnique({ where: { id: booking.cycleId }, include: { shopkeeper: true } });
  const user = await prisma.user.findUnique({ where: { id: booking.userId } });
  if (!cycle || !user) return;

  await createAndEmit({
    message: `Booking #${booking.id} cancelled. ${user.name} cancelled "${cycle.model}"`,
    type: "booking_cancelled",
    bookingId: booking.id,
    shopkeeperId: cycle.shopkeeperId,
  });

  const admins = await prisma.admin.findMany();
  for (const admin of admins) {
    await createAndEmit({
      message: `Booking #${booking.id} cancelled: ${user.name} cancelled "${cycle.model}"`,
      type: "booking_cancelled",
      bookingId: booking.id,
      adminId: admin.id,
    });
  }
};

export const getUnread = async (userId?: number, shopkeeperId?: number, adminId?: number) => {
  const where: any = { read: false };
  if (userId) where.userId = userId;
  if (shopkeeperId) where.shopkeeperId = shopkeeperId;
  if (adminId) where.adminId = adminId;
  return prisma.notification.findMany({ where, orderBy: { createdAt: "desc" }, take: 50 });
};

export const getAll = async (userId?: number, shopkeeperId?: number, adminId?: number) => {
  const where: any = {};
  if (userId) where.userId = userId;
  if (shopkeeperId) where.shopkeeperId = shopkeeperId;
  if (adminId) where.adminId = adminId;
  return prisma.notification.findMany({ where, orderBy: { createdAt: "desc" }, take: 50 });
};

export const markAllRead = async (userId?: number, shopkeeperId?: number, adminId?: number) => {
  const where: any = { read: false };
  if (userId) where.userId = userId;
  if (shopkeeperId) where.shopkeeperId = shopkeeperId;
  if (adminId) where.adminId = adminId;
  return prisma.notification.updateMany({ where, data: { read: true } });
};
