-- CreateEnum
CREATE TYPE "SchoolType" AS ENUM ('ONE_AB', 'ONE_C', 'TYPE_2', 'TYPE_3', 'OTHER');

-- CreateEnum
CREATE TYPE "SchoolMedium" AS ENUM ('SINHALA', 'TAMIL', 'ENGLISH');

-- CreateTable
CREATE TABLE "Tenant" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "schoolCode" TEXT NOT NULL,
    "schoolType" "SchoolType" NOT NULL,
    "province" TEXT,
    "district" TEXT NOT NULL,
    "zone" TEXT NOT NULL,
    "division" TEXT NOT NULL,
    "mediums" "SchoolMedium"[],
    "addressLine1" TEXT,
    "addressLine2" TEXT,
    "city" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tenant_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Tenant_schoolCode_key" ON "Tenant"("schoolCode");

-- CreateIndex
CREATE INDEX "Tenant_district_zone_idx" ON "Tenant"("district", "zone");

-- CreateIndex
CREATE INDEX "Tenant_schoolType_idx" ON "Tenant"("schoolType");

-- CreateIndex
CREATE INDEX "Tenant_isActive_idx" ON "Tenant"("isActive");
