/*
  Warnings:

  - Added the required column `senderNumberId` to the `Campaign` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "CampaignStatus" ADD VALUE 'PROCESSING';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "MessageStatus" ADD VALUE 'LOCKED';
ALTER TYPE "MessageStatus" ADD VALUE 'RETRYING';

-- AlterTable
ALTER TABLE "Campaign" ADD COLUMN     "senderNumberId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "CampaignMessage" ADD COLUMN     "sellerId" TEXT;

-- CreateIndex
CREATE INDEX "CampaignMessage_sellerId_idx" ON "CampaignMessage"("sellerId");

-- AddForeignKey
ALTER TABLE "Campaign" ADD CONSTRAINT "Campaign_senderNumberId_fkey" FOREIGN KEY ("senderNumberId") REFERENCES "SenderNumber"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignMessage" ADD CONSTRAINT "CampaignMessage_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "Seller"("id") ON DELETE SET NULL ON UPDATE CASCADE;
