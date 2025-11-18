/*
  Warnings:

  - You are about to drop the `TestItem` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "TestItem";

-- CreateTable
CREATE TABLE "AcademicYear" (
    "id" SERIAL NOT NULL,
    "label" TEXT NOT NULL,
    "numericYear" INTEGER,
    "start" TIMESTAMP(3) NOT NULL,
    "end" TIMESTAMP(3) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "AcademicYear_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AcademicYear_active_idx" ON "AcademicYear"("active");

-- CreateIndex
CREATE UNIQUE INDEX "AcademicYear_label_key" ON "AcademicYear"("label");
