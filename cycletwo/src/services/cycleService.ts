import { prisma } from "../utils/prismaClient.js";
import { CreateCycleInput } from "../types/cycleTypes.js";

export const createCycle = async (data: CreateCycleInput) => {
  return prisma.cycle.create({ data });
};

export const getAllCycles = async () => {
  return prisma.cycle.findMany({
    include: {
      shopkeeper: { select: { id: true, name: true, email: true, phone: true, location: true, address: true } },
      ratings: true
    }
  });
};

export const getCycleById = async (id: number) => {
  return prisma.cycle.findUnique({
    where: { id },
    include: {
      shopkeeper: { select: { id: true, name: true, email: true, phone: true, location: true, address: true } },
      ratings: true
    }
  });
};

export const deleteCycle = async (id: number) => {
  return prisma.cycle.delete({ where: { id } });
};
