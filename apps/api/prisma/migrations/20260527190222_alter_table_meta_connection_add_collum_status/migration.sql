-- CreateEnum
CREATE TYPE "MetaConnectionStatus" AS ENUM ('CONNECTED', 'DISCONNECTED', 'EXPIRED', 'BLOCKED');

-- AlterTable
ALTER TABLE "MetaConnection" ADD COLUMN     "status" "MetaConnectionStatus" NOT NULL DEFAULT 'CONNECTED';
