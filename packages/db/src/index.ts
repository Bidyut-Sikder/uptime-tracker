import { PrismaClient } from "@prisma/client";

export const prismaClient = new PrismaClient();
 //created once and exported in package.json ,uses everywehere by importing as dependencies in other apps