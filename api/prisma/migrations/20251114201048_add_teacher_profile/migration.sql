-- CreateEnum
CREATE TYPE "TeacherAppointmentType" AS ENUM ('PERMANENT', 'TEMPORARY', 'VOLUNTEER', 'CONTRACT');

-- CreateEnum
CREATE TYPE "TeacherEmploymentStatus" AS ENUM ('ACTIVE', 'TRANSFERRED', 'RETIRED', 'RELEASED', 'DECEASED', 'RESIGNED');

-- CreateTable
CREATE TABLE "TeacherProfile" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "userId" TEXT,
    "fullName" TEXT NOT NULL,
    "initials" TEXT,
    "nic" TEXT NOT NULL,
    "tin" TEXT NOT NULL,
    "subjectCodes" TEXT[],
    "appointmentType" "TeacherAppointmentType" NOT NULL,
    "serviceStart" TIMESTAMP(3) NOT NULL,
    "employmentStatus" "TeacherEmploymentStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeacherProfile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TeacherProfile_userId_key" ON "TeacherProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "TeacherProfile_nic_key" ON "TeacherProfile"("nic");

-- CreateIndex
CREATE UNIQUE INDEX "TeacherProfile_tin_key" ON "TeacherProfile"("tin");

-- CreateIndex
CREATE INDEX "TeacherProfile_tenantId_idx" ON "TeacherProfile"("tenantId");

-- CreateIndex
CREATE INDEX "TeacherProfile_tin_idx" ON "TeacherProfile"("tin");

-- CreateIndex
CREATE INDEX "TeacherProfile_nic_idx" ON "TeacherProfile"("nic");

-- AddForeignKey
ALTER TABLE "TeacherProfile" ADD CONSTRAINT "TeacherProfile_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherProfile" ADD CONSTRAINT "TeacherProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
