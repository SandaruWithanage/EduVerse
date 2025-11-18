-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE');

-- CreateEnum
CREATE TYPE "Religion" AS ENUM ('BUDDHIST', 'HINDU', 'ISLAM', 'CATHOLIC', 'CHRISTIAN', 'OTHER');

-- CreateEnum
CREATE TYPE "Ethnicity" AS ENUM ('SINHALA', 'SRI_LANKAN_TAMIL', 'INDIAN_TAMIL', 'MUSLIM', 'BURGHER', 'MALAY', 'OTHER');

-- CreateEnum
CREATE TYPE "MotherTongue" AS ENUM ('SINHALA', 'TAMIL', 'ENGLISH');

-- CreateTable
CREATE TABLE "StudentProfile" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "initials" TEXT,
    "dateOfBirth" TIMESTAMP(3) NOT NULL,
    "gender" "Gender" NOT NULL,
    "indexNumber" TEXT NOT NULL,
    "admissionNumber" TEXT NOT NULL,
    "admissionDate" TIMESTAMP(3) NOT NULL,
    "motherTongue" "MotherTongue" NOT NULL,
    "religion" "Religion" NOT NULL,
    "ethnicity" "Ethnicity" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "rowVersion" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentProfile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StudentProfile_tenantId_idx" ON "StudentProfile"("tenantId");

-- CreateIndex
CREATE INDEX "StudentProfile_gender_idx" ON "StudentProfile"("gender");

-- CreateIndex
CREATE INDEX "StudentProfile_isActive_idx" ON "StudentProfile"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "StudentProfile_tenantId_indexNumber_key" ON "StudentProfile"("tenantId", "indexNumber");

-- CreateIndex
CREATE UNIQUE INDEX "StudentProfile_tenantId_admissionNumber_key" ON "StudentProfile"("tenantId", "admissionNumber");

-- AddForeignKey
ALTER TABLE "StudentProfile" ADD CONSTRAINT "StudentProfile_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
