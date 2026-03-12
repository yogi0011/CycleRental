import { prisma } from "../utils/prismaClient.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { RegisterInput, LoginInput } from "../types/authTypes.js";

export const registerUser = async ({ name, email, password, role, location, phone, address }: RegisterInput & { address?: string }) => {
  const hashedPassword = await bcrypt.hash(password, 10);

  if (role === "shopkeeper") {
    const existing = await prisma.shopkeeper.findUnique({ where: { email } });
    if (existing) throw new Error("Email already registered");
    return prisma.shopkeeper.create({
      data: { name, email, password: hashedPassword, location: location || "", phone: phone || "", address: address || "" }
    });
  } else if (role === "admin") {
    const existing = await prisma.admin.findUnique({ where: { email } });
    if (existing) throw new Error("Email already registered");
    return prisma.admin.create({ data: { name, email, password: hashedPassword } });
  } else {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw new Error("Email already registered");
    return prisma.user.create({ data: { name, email, password: hashedPassword, phone: phone || "" } });
  }
};

export const loginUser = async ({ email, password, role }: LoginInput) => {
  let user: any;
  if (role === "shopkeeper") user = await prisma.shopkeeper.findUnique({ where: { email } });
  else if (role === "admin") user = await prisma.admin.findUnique({ where: { email } });
  else user = await prisma.user.findUnique({ where: { email } });

  if (!user) throw new Error("No account found with this email");
  const match = await bcrypt.compare(password, user.password);
  if (!match) throw new Error("Incorrect password");

  const token = jwt.sign({ id: user.id, email: user.email, role }, process.env.JWT_SECRET!, { expiresIn: "2h" });
  return { ...user, token, role };
};

export const requestPasswordReset = async (email: string, role: string) => {
  const token = crypto.randomBytes(32).toString("hex");
  const expiry = new Date(Date.now() + 3600000);

  if (role === "shopkeeper") {
    const user = await prisma.shopkeeper.findUnique({ where: { email } });
    if (!user) throw new Error("No account found");
    await prisma.shopkeeper.update({ where: { email }, data: { resetToken: token, resetExpiry: expiry } });
  } else {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new Error("No account found");
    await prisma.user.update({ where: { email }, data: { resetToken: token, resetExpiry: expiry } });
  }
  return token;
};

export const resetPassword = async (token: string, newPassword: string, role: string) => {
  const hashed = await bcrypt.hash(newPassword, 10);
  const now = new Date();

  if (role === "shopkeeper") {
    const user = await prisma.shopkeeper.findFirst({ where: { resetToken: token, resetExpiry: { gt: now } } });
    if (!user) throw new Error("Invalid or expired reset link");
    await prisma.shopkeeper.update({ where: { id: user.id }, data: { password: hashed, resetToken: null, resetExpiry: null } });
  } else {
    const user = await prisma.user.findFirst({ where: { resetToken: token, resetExpiry: { gt: now } } });
    if (!user) throw new Error("Invalid or expired reset link");
    await prisma.user.update({ where: { id: user.id }, data: { password: hashed, resetToken: null, resetExpiry: null } });
  }
};
