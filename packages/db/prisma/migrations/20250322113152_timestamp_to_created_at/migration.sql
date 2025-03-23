/*
  Warnings:

  - You are about to drop the column `timestamp` on the `WebsiteTick` table. All the data in the column will be lost.
  - Added the required column `createdAt` to the `WebsiteTick` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "WebsiteTick" DROP COLUMN "timestamp",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL;
