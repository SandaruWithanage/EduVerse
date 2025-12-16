-- AlterTable
ALTER TABLE "User" ADD COLUMN     "invitePending" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "inviteSentAt" TIMESTAMP(3),
ADD COLUMN     "invitedAt" TIMESTAMP(3);
