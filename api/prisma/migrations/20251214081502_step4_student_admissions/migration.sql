-- CreateEnum
CREATE TYPE "AddressType" AS ENUM ('PERMANENT', 'CURRENT');

-- AlterTable
ALTER TABLE "Parent" ALTER COLUMN "userId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "StudentParent" ADD COLUMN     "isPrimaryGuardian" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "StudentProfile" ADD COLUMN     "birthCertificateNo" TEXT,
ADD COLUMN     "civilStatus" TEXT,
ADD COLUMN     "medium" "SchoolMedium",
ADD COLUMN     "nic" TEXT;

-- CreateTable
CREATE TABLE "StudentAddress" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "type" "AddressType" NOT NULL,
    "addressLine1" TEXT NOT NULL,
    "addressLine2" TEXT,
    "city" TEXT,
    "gsDivisionCode" TEXT NOT NULL,
    "districtCode" TEXT NOT NULL,
    "telephone" TEXT,
    "mobile" TEXT NOT NULL,
    "residingFromDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StudentAddress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StudentAddress_tenantId_studentId_idx" ON "StudentAddress"("tenantId", "studentId");

-- AddForeignKey
ALTER TABLE "StudentAddress" ADD CONSTRAINT "StudentAddress_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "StudentProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentAddress" ADD CONSTRAINT "StudentAddress_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
