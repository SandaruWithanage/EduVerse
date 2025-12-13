/*
  Warnings:

  - A unique constraint covering the columns `[tenantId,code,curriculumId]` on the table `Subject` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `gradeLevel` to the `Grade` table without a default value. This is not possible if the table is not empty.
  - Added the required column `curriculumId` to the `Subject` table without a default value. This is not possible if the table is not empty.
  - Added the required column `gradeLevel` to the `Subject` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "GradeLevel" AS ENUM ('PRIMARY', 'JUNIOR', 'ORDINARY_LEVEL', 'ADVANCED_LEVEL');

-- DropIndex
DROP INDEX "Subject_tenantId_code_key";

-- AlterTable
ALTER TABLE "Grade" ADD COLUMN     "gradeLevel" "GradeLevel" NOT NULL;

-- AlterTable
ALTER TABLE "Subject" ADD COLUMN     "credits" INTEGER,
ADD COLUMN     "curriculumId" TEXT NOT NULL,
ADD COLUMN     "gradeLevel" "GradeLevel" NOT NULL,
ADD COLUMN     "isCreditBearing" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isExamSubject" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "stream" TEXT;

-- CreateTable
CREATE TABLE "Curriculum" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "startYear" INTEGER NOT NULL,
    "endYear" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Curriculum_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Subject_gradeLevel_idx" ON "Subject"("gradeLevel");

-- CreateIndex
CREATE UNIQUE INDEX "Subject_tenantId_code_curriculumId_key" ON "Subject"("tenantId", "code", "curriculumId");

-- AddForeignKey
ALTER TABLE "Subject" ADD CONSTRAINT "Subject_curriculumId_fkey" FOREIGN KEY ("curriculumId") REFERENCES "Curriculum"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
