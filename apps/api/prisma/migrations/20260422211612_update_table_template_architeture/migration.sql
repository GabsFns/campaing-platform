/*
  Warnings:

  - You are about to drop the column `content` on the `Template` table. All the data in the column will be lost.
  - Added the required column `body` to the `Template` table without a default value. This is not possible if the table is not empty.
  - Added the required column `category` to the `Template` table without a default value. This is not possible if the table is not empty.
  - Added the required column `language` to the `Template` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TemplateCategory" AS ENUM ('MARKETING', 'UTILITY', 'AUTHENTICATION');

-- CreateEnum
CREATE TYPE "TemplateStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "Template" DROP COLUMN "content",
ADD COLUMN     "body" TEXT NOT NULL,
ADD COLUMN     "category" "TemplateCategory" NOT NULL,
ADD COLUMN     "language" TEXT NOT NULL,
ADD COLUMN     "metaTemplateId" TEXT,
ADD COLUMN     "status" "TemplateStatus" NOT NULL DEFAULT 'PENDING';
