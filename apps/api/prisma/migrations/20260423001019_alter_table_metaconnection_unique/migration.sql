/*
  Warnings:

  - A unique constraint covering the columns `[workspaceId]` on the table `MetaConnection` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "MetaConnection_workspaceId_key" ON "MetaConnection"("workspaceId");
