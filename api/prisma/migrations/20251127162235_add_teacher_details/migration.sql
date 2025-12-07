-- CreateEnum
CREATE TYPE "SchoolType" AS ENUM ('ONE_AB', 'ONE_C', 'TYPE_2', 'TYPE_3', 'OTHER');

-- CreateEnum
CREATE TYPE "SchoolMedium" AS ENUM ('SINHALA', 'TAMIL', 'ENGLISH');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'TEACHER', 'CLERK', 'PARENT');

-- CreateEnum
CREATE TYPE "TeacherAppointmentType" AS ENUM ('PERMANENT', 'TEMPORARY', 'VOLUNTEER', 'CONTRACT');

-- CreateEnum
CREATE TYPE "TeacherEmploymentStatus" AS ENUM ('ACTIVE', 'TRANSFERRED', 'RETIRED', 'RELEASED', 'DECEASED', 'RESIGNED');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE');

-- CreateEnum
CREATE TYPE "Religion" AS ENUM ('BUDDHIST', 'HINDU', 'ISLAM', 'CATHOLIC', 'CHRISTIAN', 'OTHER');

-- CreateEnum
CREATE TYPE "Ethnicity" AS ENUM ('SINHALA', 'SRI_LANKAN_TAMIL', 'INDIAN_TAMIL', 'MUSLIM', 'BURGHER', 'MALAY', 'OTHER');

-- CreateEnum
CREATE TYPE "MotherTongue" AS ENUM ('SINHALA', 'TAMIL', 'ENGLISH');

-- CreateEnum
CREATE TYPE "AdmissionStatus" AS ENUM ('NEW', 'PROMOTED', 'REPEATED', 'TRANSFERRED_IN', 'TRANSFERRED_OUT');

-- CreateEnum
CREATE TYPE "TeacherClassRole" AS ENUM ('CLASS_TEACHER', 'SUBJECT_TEACHER', 'ASSISTANT_TEACHER');

-- NEW: AttendanceStatus enum
CREATE TYPE "AttendanceStatus" AS ENUM ('PRESENT', 'ABSENT', 'LATE', 'EXCUSED');

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

-- CreateTable
CREATE TABLE "StudentGradeClass" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "gradeId" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "academicYearId" INTEGER NOT NULL,
    "admissionStatus" "AdmissionStatus" NOT NULL,
    "transferReason" TEXT,
    "classIndex" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentGradeClass_pkey" PRIMARY KEY ("id")
);

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
    "dateOfBirth" TIMESTAMP(3) NOT NULL,
    "gender" "Gender" NOT NULL,
    "motherTongue" "MotherTongue" NOT NULL,
    "religion" "Religion" NOT NULL,
    "ethnicity" "Ethnicity" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeacherProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
-- UPDATED: TeacherGradeClass uses subjectId (nullable) instead of subjectCode
CREATE TABLE "TeacherGradeClass" (
    "id" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "gradeId" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "academicYearId" INTEGER NOT NULL,
    "roleInClass" "TeacherClassRole" NOT NULL,
    "subjectId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeacherGradeClass_pkey" PRIMARY KEY ("id")
);

-- NEW: Subject
CREATE TABLE "Subject" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "validGrades" INTEGER[] NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subject_pkey" PRIMARY KEY ("id")
);

-- NEW: TeacherSubject (Teacher <-> Subject)
CREATE TABLE "TeacherSubject" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeacherSubject_pkey" PRIMARY KEY ("id")
);

-- NEW: Parent
CREATE TABLE "Parent" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "phone" TEXT,
    "nic" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Parent_pkey" PRIMARY KEY ("id")
);

-- NEW: StudentParent junction
CREATE TABLE "StudentParent" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "parentId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentParent_pkey" PRIMARY KEY ("id")
);

-- NEW: Attendance
CREATE TABLE "Attendance" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "academicYearId" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "status" "AttendanceStatus" NOT NULL,
    "markedByTeacherId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Attendance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "failedLoginAttempts" INTEGER NOT NULL DEFAULT 0,
    "lockUntil" TIMESTAMP(3),
    "lastLoginAt" TIMESTAMP(3),
    "rowVersion" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RefreshToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revokedAt" TIMESTAMP(3),

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);

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

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT,
    "userId" TEXT,
    "actionCode" TEXT NOT NULL,
    "detailsJson" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "retentionUntil" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
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

-- CreateIndex
CREATE INDEX "StudentGradeClass_classId_idx" ON "StudentGradeClass"("classId");

-- CreateIndex
CREATE INDEX "StudentGradeClass_gradeId_idx" ON "StudentGradeClass"("gradeId");

-- CreateIndex
CREATE INDEX "StudentGradeClass_academicYearId_idx" ON "StudentGradeClass"("academicYearId");

-- CreateIndex
CREATE UNIQUE INDEX "StudentGradeClass_studentId_academicYearId_key" ON "StudentGradeClass"("studentId", "academicYearId");

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

-- CreateIndex
CREATE INDEX "TeacherGradeClass_gradeId_idx" ON "TeacherGradeClass"("gradeId");

-- CreateIndex
CREATE INDEX "TeacherGradeClass_classId_idx" ON "TeacherGradeClass"("classId");

-- CreateIndex
CREATE INDEX "TeacherGradeClass_academicYearId_idx" ON "TeacherGradeClass"("academicYearId");

-- UPDATED UNIQUE INDEX: allow per subject
CREATE UNIQUE INDEX "TeacherGradeClass_teacherId_classId_academicYearId_subjectId_key"
ON "TeacherGradeClass"("teacherId", "classId", "academicYearId", "subjectId");

-- NEW INDEXES / UNIQUES FOR SUBJECTS / PARENTS / ATTENDANCE

-- Subject: unique per tenant + code
CREATE UNIQUE INDEX "Subject_tenantId_code_key" ON "Subject"("tenantId", "code");
CREATE INDEX "Subject_tenantId_idx" ON "Subject"("tenantId");

-- TeacherSubject
CREATE UNIQUE INDEX "TeacherSubject_tenantId_teacherId_subjectId_key"
ON "TeacherSubject"("tenantId", "teacherId", "subjectId");
CREATE INDEX "TeacherSubject_tenantId_teacherId_idx"
ON "TeacherSubject"("tenantId", "teacherId");
CREATE INDEX "TeacherSubject_tenantId_subjectId_idx"
ON "TeacherSubject"("tenantId", "subjectId");

-- Parent
CREATE UNIQUE INDEX "Parent_userId_key" ON "Parent"("userId");
CREATE UNIQUE INDEX "Parent_nic_key" ON "Parent"("nic");
CREATE INDEX "Parent_tenantId_idx" ON "Parent"("tenantId");

-- StudentParent
CREATE UNIQUE INDEX "StudentParent_tenantId_studentId_parentId_key"
ON "StudentParent"("tenantId", "studentId", "parentId");
CREATE INDEX "StudentParent_tenantId_studentId_idx"
ON "StudentParent"("tenantId", "studentId");
CREATE INDEX "StudentParent_tenantId_parentId_idx"
ON "StudentParent"("tenantId", "parentId");

-- Attendance
CREATE INDEX "Attendance_tenantId_date_idx" ON "Attendance"("tenantId", "date");
CREATE INDEX "Attendance_classId_date_idx" ON "Attendance"("classId", "date");

-- CreateIndex
CREATE INDEX "User_tenantId_role_idx" ON "User"("tenantId", "role");

-- CreateIndex
CREATE INDEX "User_isActive_idx" ON "User"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "User_tenantId_email_key" ON "User"("tenantId", "email");

-- CreateIndex
CREATE INDEX "RefreshToken_userId_idx" ON "RefreshToken"("userId");

-- CreateIndex
CREATE INDEX "RefreshToken_expiresAt_idx" ON "RefreshToken"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "Tenant_schoolCode_key" ON "Tenant"("schoolCode");

-- CreateIndex
CREATE INDEX "Tenant_district_zone_idx" ON "Tenant"("district", "zone");

-- CreateIndex
CREATE INDEX "Tenant_schoolType_idx" ON "Tenant"("schoolType");

-- CreateIndex
CREATE INDEX "Tenant_isActive_idx" ON "Tenant"("isActive");

-- CreateIndex
CREATE INDEX "AcademicYear_active_idx" ON "AcademicYear"("active");

-- CreateIndex
CREATE UNIQUE INDEX "AcademicYear_label_key" ON "AcademicYear"("label");

-- CreateIndex
CREATE INDEX "AuditLog_tenantId_idx" ON "AuditLog"("tenantId");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_actionCode_idx" ON "AuditLog"("actionCode");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- AddForeignKey
ALTER TABLE "StudentProfile"
ADD CONSTRAINT "StudentProfile_tenantId_fkey"
FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentGradeClass"
ADD CONSTRAINT "StudentGradeClass_studentId_fkey"
FOREIGN KEY ("studentId") REFERENCES "StudentProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentGradeClass"
ADD CONSTRAINT "StudentGradeClass_gradeId_fkey"
FOREIGN KEY ("gradeId") REFERENCES "Grade"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentGradeClass"
ADD CONSTRAINT "StudentGradeClass_classId_fkey"
FOREIGN KEY ("classId") REFERENCES "Classroom"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentGradeClass"
ADD CONSTRAINT "StudentGradeClass_academicYearId_fkey"
FOREIGN KEY ("academicYearId") REFERENCES "AcademicYear"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Grade"
ADD CONSTRAINT "Grade_tenantId_fkey"
FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Grade"
ADD CONSTRAINT "Grade_academicYearId_fkey"
FOREIGN KEY ("academicYearId") REFERENCES "AcademicYear"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Classroom"
ADD CONSTRAINT "Classroom_gradeId_fkey"
FOREIGN KEY ("gradeId") REFERENCES "Grade"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Classroom"
ADD CONSTRAINT "Classroom_tenantId_fkey"
FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherProfile"
ADD CONSTRAINT "TeacherProfile_tenantId_fkey"
FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherProfile"
ADD CONSTRAINT "TeacherProfile_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherGradeClass"
ADD CONSTRAINT "TeacherGradeClass_teacherId_fkey"
FOREIGN KEY ("teacherId") REFERENCES "TeacherProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherGradeClass"
ADD CONSTRAINT "TeacherGradeClass_gradeId_fkey"
FOREIGN KEY ("gradeId") REFERENCES "Grade"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherGradeClass"
ADD CONSTRAINT "TeacherGradeClass_classId_fkey"
FOREIGN KEY ("classId") REFERENCES "Classroom"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherGradeClass"
ADD CONSTRAINT "TeacherGradeClass_academicYearId_fkey"
FOREIGN KEY ("academicYearId") REFERENCES "AcademicYear"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- NEW: TeacherGradeClass.subjectId -> Subject
ALTER TABLE "TeacherGradeClass"
ADD CONSTRAINT "TeacherGradeClass_subjectId_fkey"
FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- NEW: Subject.tenantId -> Tenant
ALTER TABLE "Subject"
ADD CONSTRAINT "Subject_tenantId_fkey"
FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- NEW: TeacherSubject.tenantId -> Tenant
ALTER TABLE "TeacherSubject"
ADD CONSTRAINT "TeacherSubject_tenantId_fkey"
FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- NEW: TeacherSubject.teacherId -> TeacherProfile
ALTER TABLE "TeacherSubject"
ADD CONSTRAINT "TeacherSubject_teacherId_fkey"
FOREIGN KEY ("teacherId") REFERENCES "TeacherProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- NEW: TeacherSubject.subjectId -> Subject
ALTER TABLE "TeacherSubject"
ADD CONSTRAINT "TeacherSubject_subjectId_fkey"
FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- NEW: Parent.tenantId -> Tenant
ALTER TABLE "Parent"
ADD CONSTRAINT "Parent_tenantId_fkey"
FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- NEW: Parent.userId -> User
ALTER TABLE "Parent"
ADD CONSTRAINT "Parent_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- NEW: StudentParent.tenantId -> Tenant
ALTER TABLE "StudentParent"
ADD CONSTRAINT "StudentParent_tenantId_fkey"
FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- NEW: StudentParent.studentId -> StudentProfile
ALTER TABLE "StudentParent"
ADD CONSTRAINT "StudentParent_studentId_fkey"
FOREIGN KEY ("studentId") REFERENCES "StudentProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- NEW: StudentParent.parentId -> Parent
ALTER TABLE "StudentParent"
ADD CONSTRAINT "StudentParent_parentId_fkey"
FOREIGN KEY ("parentId") REFERENCES "Parent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- NEW: Attendance.tenantId -> Tenant
ALTER TABLE "Attendance"
ADD CONSTRAINT "Attendance_tenantId_fkey"
FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- NEW: Attendance.studentId -> StudentProfile
ALTER TABLE "Attendance"
ADD CONSTRAINT "Attendance_studentId_fkey"
FOREIGN KEY ("studentId") REFERENCES "StudentProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- NEW: Attendance.classId -> Classroom
ALTER TABLE "Attendance"
ADD CONSTRAINT "Attendance_classId_fkey"
FOREIGN KEY ("classId") REFERENCES "Classroom"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- NEW: Attendance.academicYearId -> AcademicYear
ALTER TABLE "Attendance"
ADD CONSTRAINT "Attendance_academicYearId_fkey"
FOREIGN KEY ("academicYearId") REFERENCES "AcademicYear"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- NEW: Attendance.markedByTeacherId -> TeacherProfile
ALTER TABLE "Attendance"
ADD CONSTRAINT "Attendance_markedByTeacherId_fkey"
FOREIGN KEY ("markedByTeacherId") REFERENCES "TeacherProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User"
ADD CONSTRAINT "User_tenantId_fkey"
FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefreshToken"
ADD CONSTRAINT "RefreshToken_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog"
ADD CONSTRAINT "AuditLog_tenantId_fkey"
FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog"
ADD CONSTRAINT "AuditLog_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- SUBJECT RLS
ALTER TABLE "Subject" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Subject" FORCE ROW LEVEL SECURITY;

CREATE POLICY subject_tenant_isolation ON "Subject"
USING ("tenantId" = current_setting('app.tenant_id')::text); -- ✅ Fixed

CREATE POLICY subject_super_admin_bypass ON "Subject"
USING (current_setting('app.role', true) = 'SUPER_ADMIN');

-- TEACHER SUBJECT RLS
ALTER TABLE "TeacherSubject" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "TeacherSubject" FORCE ROW LEVEL SECURITY;

CREATE POLICY teacher_subject_tenant_isolation ON "TeacherSubject"
USING ("tenantId" = current_setting('app.tenant_id')::text); -- ✅ Fixed

CREATE POLICY teacher_subject_super_admin_bypass ON "TeacherSubject"
USING (current_setting('app.role', true) = 'SUPER_ADMIN');

-- PARENT RLS
ALTER TABLE "Parent" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Parent" FORCE ROW LEVEL SECURITY;

CREATE POLICY parent_tenant_isolation ON "Parent"
USING ("tenantId" = current_setting('app.tenant_id')::text); -- ✅ Fixed

CREATE POLICY parent_super_admin_bypass ON "Parent"
USING (current_setting('app.role', true) = 'SUPER_ADMIN');

-- STUDENT PARENT RLS
ALTER TABLE "StudentParent" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "StudentParent" FORCE ROW LEVEL SECURITY;

CREATE POLICY student_parent_tenant_isolation ON "StudentParent"
USING ("tenantId" = current_setting('app.tenant_id')::text); -- ✅ Fixed

CREATE POLICY student_parent_super_admin_bypass ON "StudentParent"
USING (current_setting('app.role', true) = 'SUPER_ADMIN');

-- ATTENDANCE RLS
ALTER TABLE "Attendance" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Attendance" FORCE ROW LEVEL SECURITY;

CREATE POLICY attendance_tenant_isolation ON "Attendance"
USING ("tenantId" = current_setting('app.tenant_id')::text); -- ✅ Fixed

CREATE POLICY attendance_super_admin_bypass ON "Attendance"
USING (current_setting('app.role', true) = 'SUPER_ADMIN');

-- 1. Secure Student Profiles (CRITICAL)
ALTER TABLE "StudentProfile" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "StudentProfile" FORCE ROW LEVEL SECURITY;

CREATE POLICY student_tenant_isolation ON "StudentProfile"
USING ("tenantId" = current_setting('app.tenant_id')::text);

CREATE POLICY student_super_admin_bypass ON "StudentProfile"
USING (current_setting('app.role', true) = 'SUPER_ADMIN');

-- 2. Secure Teacher Profiles
ALTER TABLE "TeacherProfile" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "TeacherProfile" FORCE ROW LEVEL SECURITY;

CREATE POLICY teacher_tenant_isolation ON "TeacherProfile"
USING ("tenantId" = current_setting('app.tenant_id')::text);

CREATE POLICY teacher_super_admin_bypass ON "TeacherProfile"
USING (current_setting('app.role', true) = 'SUPER_ADMIN');

-- 3. Secure Grades and Classrooms
ALTER TABLE "Grade" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Grade" FORCE ROW LEVEL SECURITY;
CREATE POLICY grade_isolation ON "Grade" USING ("tenantId" = current_setting('app.tenant_id')::text);
CREATE POLICY grade_admin_bypass ON "Grade" USING (current_setting('app.role', true) = 'SUPER_ADMIN');

ALTER TABLE "Classroom" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Classroom" FORCE ROW LEVEL SECURITY;
CREATE POLICY class_isolation ON "Classroom" USING ("tenantId" = current_setting('app.tenant_id')::text);
CREATE POLICY class_admin_bypass ON "Classroom" USING (current_setting('app.role', true) = 'SUPER_ADMIN');

-- 4. Secure User Accounts
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "User" FORCE ROW LEVEL SECURITY;

CREATE POLICY user_tenant_isolation ON "User"
USING (
  "tenantId" = current_setting('app.tenant_id')::text 
  OR "tenantId" IS NULL -- Allows seeing Super Admins if necessary, or remove this line to hide them
  OR id = current_setting('app.user_id', true) -- Always allow users to see themselves
);

CREATE POLICY user_super_admin_bypass ON "User"
USING (current_setting('app.role', true) = 'SUPER_ADMIN');

-- 5. Secure Audit Logs
ALTER TABLE "AuditLog" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AuditLog" FORCE ROW LEVEL SECURITY;

CREATE POLICY audit_tenant_isolation ON "AuditLog"
USING ("tenantId" = current_setting('app.tenant_id')::text);

CREATE POLICY audit_super_admin_bypass ON "AuditLog"
USING (current_setting('app.role', true) = 'SUPER_ADMIN');