-- CreateEnum
CREATE TYPE "TimetableOverrideReason" AS ENUM ('SUBSTITUTION', 'TEMP_CHANGE', 'OTHER');

-- CreateTable
CREATE TABLE "TimetableOverride" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "academicYearId" INTEGER NOT NULL,
    "slotId" TEXT NOT NULL,
    "dateFrom" TIMESTAMP(3) NOT NULL,
    "dateTo" TIMESTAMP(3) NOT NULL,
    "overrideTeacherId" TEXT,
    "overrideSubjectId" TEXT,
    "reason" "TimetableOverrideReason" NOT NULL DEFAULT 'SUBSTITUTION',
    "note" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TimetableOverride_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TimetableOverride_tenantId_academicYearId_idx" ON "TimetableOverride"("tenantId", "academicYearId");

-- CreateIndex
CREATE INDEX "TimetableOverride_tenantId_slotId_idx" ON "TimetableOverride"("tenantId", "slotId");

-- CreateIndex
CREATE INDEX "TimetableOverride_tenantId_dateFrom_dateTo_idx" ON "TimetableOverride"("tenantId", "dateFrom", "dateTo");

-- CreateIndex
CREATE INDEX "TimetableOverride_tenantId_overrideTeacherId_idx" ON "TimetableOverride"("tenantId", "overrideTeacherId");

-- AddForeignKey
ALTER TABLE "TimetableOverride" ADD CONSTRAINT "TimetableOverride_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimetableOverride" ADD CONSTRAINT "TimetableOverride_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES "AcademicYear"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimetableOverride" ADD CONSTRAINT "TimetableOverride_slotId_fkey" FOREIGN KEY ("slotId") REFERENCES "TimetableSlot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimetableOverride" ADD CONSTRAINT "TimetableOverride_overrideTeacherId_fkey" FOREIGN KEY ("overrideTeacherId") REFERENCES "TeacherProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimetableOverride" ADD CONSTRAINT "TimetableOverride_overrideSubjectId_fkey" FOREIGN KEY ("overrideSubjectId") REFERENCES "Subject"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimetableOverride" ADD CONSTRAINT "TimetableOverride_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
