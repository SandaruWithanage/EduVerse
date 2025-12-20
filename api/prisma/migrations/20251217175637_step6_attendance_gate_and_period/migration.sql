/*
  Warnings:

  - A unique constraint covering the columns `[tenantId,classId,academicYearId,studentId,date,period]` on the table `Attendance` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tenantId,systemCode]` on the table `StudentProfile` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tenantId,systemCode]` on the table `TeacherProfile` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Attendance" ADD COLUMN     "period" INTEGER;

-- AlterTable
ALTER TABLE "StudentProfile" ADD COLUMN     "systemCode" TEXT;

-- AlterTable
ALTER TABLE "TeacherProfile" ADD COLUMN     "systemCode" TEXT;

-- CreateTable
CREATE TABLE "GateAttendance" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "academicYearId" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "arrivalTime" TIMESTAMP(3),
    "status" "AttendanceStatus" NOT NULL,
    "scannedByDevice" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GateAttendance_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GateAttendance_tenantId_date_idx" ON "GateAttendance"("tenantId", "date");

-- CreateIndex
CREATE INDEX "GateAttendance_status_idx" ON "GateAttendance"("status");

-- CreateIndex
CREATE UNIQUE INDEX "GateAttendance_studentId_academicYearId_date_key" ON "GateAttendance"("studentId", "academicYearId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "Attendance_tenantId_classId_academicYearId_studentId_date_p_key" ON "Attendance"("tenantId", "classId", "academicYearId", "studentId", "date", "period");

-- CreateIndex
CREATE UNIQUE INDEX "StudentProfile_tenantId_systemCode_key" ON "StudentProfile"("tenantId", "systemCode");

-- CreateIndex
CREATE UNIQUE INDEX "TeacherProfile_tenantId_systemCode_key" ON "TeacherProfile"("tenantId", "systemCode");

-- AddForeignKey
ALTER TABLE "GateAttendance" ADD CONSTRAINT "GateAttendance_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GateAttendance" ADD CONSTRAINT "GateAttendance_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "StudentProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GateAttendance" ADD CONSTRAINT "GateAttendance_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES "AcademicYear"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
