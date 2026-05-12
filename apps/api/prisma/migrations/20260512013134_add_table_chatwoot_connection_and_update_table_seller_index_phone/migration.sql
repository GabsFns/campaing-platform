/*
  Warnings:

  - You are about to drop the column `phone` on the `Seller` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[workspaceId,chatwootAgentId]` on the table `Seller` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Seller_workspaceId_idx";

-- DropIndex
DROP INDEX "Seller_workspaceId_name_key";

-- AlterTable
ALTER TABLE "Seller" DROP COLUMN "phone",
ADD COLUMN     "chatwootAccountId" INTEGER,
ADD COLUMN     "phoneNormalized" TEXT,
ADD COLUMN     "phoneRaw" TEXT;

-- CreateTable
CREATE TABLE "ChatwootConnection" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "baseUrl" TEXT NOT NULL,
    "apiToken" TEXT NOT NULL,
    "accountId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatwootConnection_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ChatwootConnection_workspaceId_key" ON "ChatwootConnection"("workspaceId");

-- CreateIndex
CREATE INDEX "Seller_phoneNormalized_idx" ON "Seller"("phoneNormalized");

-- CreateIndex
CREATE UNIQUE INDEX "Seller_workspaceId_chatwootAgentId_key" ON "Seller"("workspaceId", "chatwootAgentId");

-- AddForeignKey
ALTER TABLE "ChatwootConnection" ADD CONSTRAINT "ChatwootConnection_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
