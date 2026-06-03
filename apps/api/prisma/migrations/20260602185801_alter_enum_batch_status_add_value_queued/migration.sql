/*
  Warnings:

  - A unique constraint covering the columns `[campaignId,contactId]` on the table `CampaignMessage` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `CampaignBatch` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "BatchStatus" ADD VALUE 'QUEUED';

-- AlterTable
ALTER TABLE "CampaignBatch" ADD COLUMN     "error" TEXT,
ADD COLUMN     "failedCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "lastHeartbeatAt" TIMESTAMP(3),
ADD COLUMN     "lockToken" TEXT,
ADD COLUMN     "lockedAt" TIMESTAMP(3),
ADD COLUMN     "processedCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "queuedAt" TIMESTAMP(3),
ADD COLUMN     "retryCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "successCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "CampaignMessage" ADD COLUMN     "providerStatus" TEXT;

-- CreateIndex
CREATE INDEX "CampaignBatch_status_idx" ON "CampaignBatch"("status");

-- CreateIndex
CREATE INDEX "CampaignBatch_lockedAt_idx" ON "CampaignBatch"("lockedAt");

-- CreateIndex
CREATE INDEX "CampaignMessage_status_nextRetryAt_idx" ON "CampaignMessage"("status", "nextRetryAt");

-- CreateIndex
CREATE INDEX "CampaignMessage_processedAt_idx" ON "CampaignMessage"("processedAt");

-- CreateIndex
CREATE INDEX "CampaignMessage_lockedAt_idx" ON "CampaignMessage"("lockedAt");

-- CreateIndex
CREATE UNIQUE INDEX "CampaignMessage_campaignId_contactId_key" ON "CampaignMessage"("campaignId", "contactId");
