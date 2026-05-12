-- CreateTable
CREATE TABLE "MetaConnection" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "wabaId" TEXT NOT NULL,
    "phoneNumberId" TEXT NOT NULL,
    "phoneNumber" TEXT,
    "displayName" TEXT,
    "webhookToken" TEXT,
    "webhookUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MetaConnection_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "MetaConnection" ADD CONSTRAINT "MetaConnection_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
