/*
  Warnings:

  - Added the required column `updateAt` to the `Seller` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Seller" ADD COLUMN     "availabilityStatus" TEXT,
ADD COLUMN     "email" TEXT,
ADD COLUMN     "role" TEXT,
ADD COLUMN     "updateAt" TIMESTAMP(3) NOT NULL;
