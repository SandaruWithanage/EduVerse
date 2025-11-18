-- CreateTable
CREATE TABLE "Grade" (
    "id" TEXT NOT NULL,
    "gradeNumber" INTEGER NOT NULL,
    "name" TEXT,
    "tenantId" TEXT NOT NULL,
    "academicYearId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Grade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Classroom" (
    "id" TEXT NOT NULL,
    "gradeId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "className" TEXT NOT NULL,
    "classCode" TEXT NOT NULL,
    "capacity" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Classroom_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Grade_tenantId_idx" ON "Grade"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "Grade_tenantId_gradeNumber_key" ON "Grade"("tenantId", "gradeNumber");

-- CreateIndex
CREATE INDEX "Classroom_tenantId_idx" ON "Classroom"("tenantId");

-- CreateIndex
CREATE INDEX "Classroom_gradeId_idx" ON "Classroom"("gradeId");

-- CreateIndex
CREATE UNIQUE INDEX "Classroom_tenantId_gradeId_className_key" ON "Classroom"("tenantId", "gradeId", "className");

-- CreateIndex
CREATE UNIQUE INDEX "Classroom_tenantId_classCode_key" ON "Classroom"("tenantId", "classCode");

-- AddForeignKey
ALTER TABLE "Grade" ADD CONSTRAINT "Grade_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Grade" ADD CONSTRAINT "Grade_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES "AcademicYear"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Classroom" ADD CONSTRAINT "Classroom_gradeId_fkey" FOREIGN KEY ("gradeId") REFERENCES "Grade"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Classroom" ADD CONSTRAINT "Classroom_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
