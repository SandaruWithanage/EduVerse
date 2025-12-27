-- CreateEnum
CREATE TYPE "DayOfWeek" AS ENUM ('MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN');

-- CreateEnum
CREATE TYPE "LeaveStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "LeaveReason" AS ENUM ('SICK', 'OFFICIAL', 'PERSONAL', 'OTHER');

-- CreateTable
CREATE TABLE "TimetableSlot" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "academicYearId" INTEGER NOT NULL,
    "dayOfWeek" "DayOfWeek" NOT NULL,
    "periodNumber" INTEGER NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "room" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TimetableSlot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeacherLeave" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "academicYearId" INTEGER,
    "dateFrom" TIMESTAMP(3) NOT NULL,
    "dateTo" TIMESTAMP(3) NOT NULL,
    "reasonCode" "LeaveReason" NOT NULL,
    "note" TEXT,
    "status" "LeaveStatus" NOT NULL DEFAULT 'PENDING',
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approvedByUserId" TEXT,
    "approvedAt" TIMESTAMP(3),
    "decisionNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeacherLeave_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TimetableSlot_tenantId_academicYearId_idx" ON "TimetableSlot"("tenantId", "academicYearId");

-- CreateIndex
CREATE INDEX "TimetableSlot_tenantId_teacherId_idx" ON "TimetableSlot"("tenantId", "teacherId");

-- CreateIndex
CREATE INDEX "TimetableSlot_tenantId_classId_idx" ON "TimetableSlot"("tenantId", "classId");

-- CreateIndex
CREATE UNIQUE INDEX "TimetableSlot_tenantId_academicYearId_classId_dayOfWeek_per_key" ON "TimetableSlot"("tenantId", "academicYearId", "classId", "dayOfWeek", "periodNumber");

-- CreateIndex
CREATE INDEX "TeacherLeave_tenantId_teacherId_idx" ON "TeacherLeave"("tenantId", "teacherId");

-- CreateIndex
CREATE INDEX "TeacherLeave_tenantId_status_idx" ON "TeacherLeave"("tenantId", "status");

-- CreateIndex
CREATE INDEX "TeacherLeave_tenantId_dateFrom_dateTo_idx" ON "TeacherLeave"("tenantId", "dateFrom", "dateTo");

-- AddForeignKey
ALTER TABLE "TimetableSlot" ADD CONSTRAINT "TimetableSlot_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimetableSlot" ADD CONSTRAINT "TimetableSlot_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES "AcademicYear"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimetableSlot" ADD CONSTRAINT "TimetableSlot_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Classroom"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimetableSlot" ADD CONSTRAINT "TimetableSlot_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimetableSlot" ADD CONSTRAINT "TimetableSlot_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "TeacherProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherLeave" ADD CONSTRAINT "TeacherLeave_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherLeave" ADD CONSTRAINT "TeacherLeave_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "TeacherProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherLeave" ADD CONSTRAINT "TeacherLeave_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES "AcademicYear"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherLeave" ADD CONSTRAINT "TeacherLeave_approvedByUserId_fkey" FOREIGN KEY ("approvedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
