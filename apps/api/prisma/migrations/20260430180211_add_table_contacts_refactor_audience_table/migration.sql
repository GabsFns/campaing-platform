/*
  Warnings:

  - You are about to drop the column `chatwootContactId` on the `AudienceContact` table. All the data in the column will be lost.
  - You are about to drop the column `chatwootSourceId` on the `AudienceContact` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `AudienceContact` table. All the data in the column will be lost.
  - You are about to drop the column `hasWhatsapp` on the `AudienceContact` table. All the data in the column will be lost.
  - You are about to drop the column `isBlocked` on the `AudienceContact` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `AudienceContact` table. All the data in the column will be lost.
  - You are about to drop the column `phoneNormalized` on the `AudienceContact` table. All the data in the column will be lost.
  - You are about to drop the column `phoneRaw` on the `AudienceContact` table. All the data in the column will be lost.
  - You are about to drop the column `workspaceId` on the `AudienceContact` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[audienceId,contactId]` on the table `AudienceContact` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `contactId` to the `AudienceContact` table without a default value. This is not possible if the table is not empty.
  - Added the required column `workspaceId` to the `Seller` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "AudienceContact" DROP CONSTRAINT "AudienceContact_workspaceId_fkey";

-- DropForeignKey
ALTER TABLE "CampaignMessage" DROP CONSTRAINT "CampaignMessage_contactId_fkey";

-- DropIndex
DROP INDEX "AudienceContact_audienceId_idx";

-- DropIndex
DROP INDEX "AudienceContact_chatwootContactId_idx";

-- DropIndex
DROP INDEX "AudienceContact_phoneNormalized_idx";

-- DropIndex
DROP INDEX "AudienceContact_workspaceId_phoneNormalized_key";

-- AlterTable
ALTER TABLE "AudienceContact" DROP COLUMN "chatwootContactId",
DROP COLUMN "chatwootSourceId",
DROP COLUMN "email",
DROP COLUMN "hasWhatsapp",
DROP COLUMN "isBlocked",
DROP COLUMN "name",
DROP COLUMN "phoneNormalized",
DROP COLUMN "phoneRaw",
DROP COLUMN "workspaceId",
ADD COLUMN     "contactId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Seller" ADD COLUMN     "workspaceId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Contact" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "name" TEXT,
    "phoneRaw" TEXT NOT NULL,
    "phoneNormalized" TEXT NOT NULL,
    "email" TEXT,
    "hasWhatsapp" BOOLEAN NOT NULL DEFAULT true,
    "isBlocked" BOOLEAN NOT NULL DEFAULT false,
    "chatwootContactId" TEXT,
    "chatwootSourceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Contact_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Contact_phoneNormalized_idx" ON "Contact"("phoneNormalized");

-- CreateIndex
CREATE INDEX "Contact_workspaceId_idx" ON "Contact"("workspaceId");

-- CreateIndex
CREATE UNIQUE INDEX "Contact_workspaceId_phoneNormalized_key" ON "Contact"("workspaceId", "phoneNormalized");

-- CreateIndex
CREATE INDEX "Audience_workspaceId_idx" ON "Audience"("workspaceId");

-- CreateIndex
CREATE INDEX "AudienceContact_contactId_idx" ON "AudienceContact"("contactId");

-- CreateIndex
CREATE INDEX "AudienceContact_sellerId_idx" ON "AudienceContact"("sellerId");

-- CreateIndex
CREATE UNIQUE INDEX "AudienceContact_audienceId_contactId_key" ON "AudienceContact"("audienceId", "contactId");

-- CreateIndex
CREATE INDEX "Seller_workspaceId_idx" ON "Seller"("workspaceId");

-- AddForeignKey
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AudienceContact" ADD CONSTRAINT "AudienceContact_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Seller" ADD CONSTRAINT "Seller_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignMessage" ADD CONSTRAINT "CampaignMessage_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatwootConversation" ADD CONSTRAINT "ChatwootConversation_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE SET NULL ON UPDATE CASCADE;
