-- CreateEnum
CREATE TYPE "InviteChannel" AS ENUM ('EMAIL');

-- CreateEnum
CREATE TYPE "InviteStatus" AS ENUM ('PENDING', 'SENT', 'FAILED');

-- CreateTable
CREATE TABLE "InviteOutbox" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "channel" "InviteChannel" NOT NULL DEFAULT 'EMAIL',
    "status" "InviteStatus" NOT NULL DEFAULT 'PENDING',
    "toEmail" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "payloadJson" TEXT NOT NULL,
    "error" TEXT,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sentAt" TIMESTAMP(3),

    CONSTRAINT "InviteOutbox_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "InviteOutbox_tenantId_status_idx" ON "InviteOutbox"("tenantId", "status");

-- CreateIndex
CREATE INDEX "InviteOutbox_status_createdAt_idx" ON "InviteOutbox"("status", "createdAt");

-- AddForeignKey
ALTER TABLE "InviteOutbox" ADD CONSTRAINT "InviteOutbox_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
