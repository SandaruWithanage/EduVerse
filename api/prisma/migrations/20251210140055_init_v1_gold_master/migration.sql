-- =========================================================
-- 1. ENUMS & TYPES
-- =========================================================

CREATE TYPE "SchoolType" AS ENUM ('ONE_AB', 'ONE_C', 'TYPE_2', 'TYPE_3', 'OTHER');
CREATE TYPE "SchoolMedium" AS ENUM ('SINHALA', 'TAMIL', 'ENGLISH');
CREATE TYPE "UserRole" AS ENUM ('SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'TEACHER', 'CLERK', 'PARENT');
CREATE TYPE "TeacherAppointmentType" AS ENUM ('PERMANENT', 'TEMPORARY', 'VOLUNTEER', 'CONTRACT');
CREATE TYPE "TeacherEmploymentStatus" AS ENUM ('ACTIVE', 'TRANSFERRED', 'RETIRED', 'RELEASED', 'DECEASED', 'RESIGNED');
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE');
CREATE TYPE "Religion" AS ENUM ('BUDDHIST', 'HINDU', 'ISLAM', 'CATHOLIC', 'CHRISTIAN', 'OTHER');
CREATE TYPE "Ethnicity" AS ENUM ('SINHALA', 'SRI_LANKAN_TAMIL', 'INDIAN_TAMIL', 'MUSLIM', 'BURGHER', 'MALAY', 'OTHER');
CREATE TYPE "MotherTongue" AS ENUM ('SINHALA', 'TAMIL', 'ENGLISH');
CREATE TYPE "AdmissionStatus" AS ENUM ('NEW', 'PROMOTED', 'REPEATED', 'TRANSFERRED_IN', 'TRANSFERRED_OUT');
CREATE TYPE "TeacherClassRole" AS ENUM ('CLASS_TEACHER', 'SUBJECT_TEACHER', 'ASSISTANT_TEACHER');
CREATE TYPE "AttendanceStatus" AS ENUM ('PRESENT', 'ABSENT', 'LATE', 'EXCUSED');

-- =========================================================
-- 2. TABLE DEFINITIONS
-- =========================================================

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

CREATE TABLE "TeacherSubject" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "TeacherSubject_pkey" PRIMARY KEY ("id")
);

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

CREATE TABLE "StudentParent" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "parentId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "StudentParent_pkey" PRIMARY KEY ("id")
);

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

CREATE TABLE "RefreshToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revokedAt" TIMESTAMP(3),
    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);

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

CREATE TABLE "AcademicYear" (
    "id" SERIAL NOT NULL,
    "label" TEXT NOT NULL,
    "numericYear" INTEGER,
    "start" TIMESTAMP(3) NOT NULL,
    "end" TIMESTAMP(3) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "AcademicYear_pkey" PRIMARY KEY ("id")
);

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

-- =========================================================
-- 3. INDEXES
-- =========================================================

-- StudentProfile Indexes
CREATE INDEX "StudentProfile_tenantId_idx" ON "StudentProfile"("tenantId");
CREATE INDEX "StudentProfile_gender_idx" ON "StudentProfile"("gender");
CREATE INDEX "StudentProfile_isActive_idx" ON "StudentProfile"("isActive");
CREATE UNIQUE INDEX "StudentProfile_tenantId_indexNumber_key" ON "StudentProfile"("tenantId", "indexNumber");
CREATE UNIQUE INDEX "StudentProfile_tenantId_admissionNumber_key" ON "StudentProfile"("tenantId", "admissionNumber");

-- StudentGradeClass Indexes
CREATE INDEX "StudentGradeClass_classId_idx" ON "StudentGradeClass"("classId");
CREATE INDEX "StudentGradeClass_gradeId_idx" ON "StudentGradeClass"("gradeId");
CREATE INDEX "StudentGradeClass_academicYearId_idx" ON "StudentGradeClass"("academicYearId");
CREATE UNIQUE INDEX "StudentGradeClass_studentId_academicYearId_key" ON "StudentGradeClass"("studentId", "academicYearId");

-- Grade Indexes
CREATE INDEX "Grade_tenantId_idx" ON "Grade"("tenantId");
CREATE UNIQUE INDEX "Grade_tenantId_gradeNumber_key" ON "Grade"("tenantId", "gradeNumber");

-- Classroom Indexes
CREATE INDEX "Classroom_tenantId_idx" ON "Classroom"("tenantId");
CREATE INDEX "Classroom_gradeId_idx" ON "Classroom"("gradeId");
CREATE UNIQUE INDEX "Classroom_tenantId_gradeId_className_key" ON "Classroom"("tenantId", "gradeId", "className");
CREATE UNIQUE INDEX "Classroom_tenantId_classCode_key" ON "Classroom"("tenantId", "classCode");

-- TeacherProfile Indexes
CREATE UNIQUE INDEX "TeacherProfile_userId_key" ON "TeacherProfile"("userId");
CREATE UNIQUE INDEX "TeacherProfile_nic_key" ON "TeacherProfile"("nic");
CREATE UNIQUE INDEX "TeacherProfile_tin_key" ON "TeacherProfile"("tin");
CREATE INDEX "TeacherProfile_tenantId_idx" ON "TeacherProfile"("tenantId");
CREATE INDEX "TeacherProfile_tin_idx" ON "TeacherProfile"("tin");
CREATE INDEX "TeacherProfile_nic_idx" ON "TeacherProfile"("nic");

-- TeacherGradeClass Indexes
CREATE INDEX "TeacherGradeClass_gradeId_idx" ON "TeacherGradeClass"("gradeId");
CREATE INDEX "TeacherGradeClass_classId_idx" ON "TeacherGradeClass"("classId");
CREATE INDEX "TeacherGradeClass_academicYearId_idx" ON "TeacherGradeClass"("academicYearId");
CREATE UNIQUE INDEX "TeacherGradeClass_teacherId_classId_academicYearId_subjectId_key"
ON "TeacherGradeClass"("teacherId", "classId", "academicYearId", "subjectId");

-- Subject/TeacherSubject/Parent Indexes
CREATE UNIQUE INDEX "Subject_tenantId_code_key" ON "Subject"("tenantId", "code");
CREATE INDEX "Subject_tenantId_idx" ON "Subject"("tenantId");

CREATE UNIQUE INDEX "TeacherSubject_tenantId_teacherId_subjectId_key"
ON "TeacherSubject"("tenantId", "teacherId", "subjectId");
CREATE INDEX "TeacherSubject_tenantId_teacherId_idx"
ON "TeacherSubject"("tenantId", "teacherId");
CREATE INDEX "TeacherSubject_tenantId_subjectId_idx"
ON "TeacherSubject"("tenantId", "subjectId");

CREATE UNIQUE INDEX "Parent_userId_key" ON "Parent"("userId");
CREATE UNIQUE INDEX "Parent_nic_key" ON "Parent"("nic");
CREATE INDEX "Parent_tenantId_idx" ON "Parent"("tenantId");

CREATE UNIQUE INDEX "StudentParent_tenantId_studentId_parentId_key"
ON "StudentParent"("tenantId", "studentId", "parentId");
CREATE INDEX "StudentParent_tenantId_studentId_idx"
ON "StudentParent"("tenantId", "studentId");
CREATE INDEX "StudentParent_tenantId_parentId_idx"
ON "StudentParent"("tenantId", "parentId");

-- Attendance Indexes
CREATE INDEX "Attendance_tenantId_date_idx" ON "Attendance"("tenantId", "date");
CREATE INDEX "Attendance_classId_date_idx" ON "Attendance"("classId", "date");

-- User/System Indexes
CREATE INDEX "User_tenantId_role_idx" ON "User"("tenantId", "role");
CREATE INDEX "User_isActive_idx" ON "User"("isActive");
CREATE UNIQUE INDEX "User_tenantId_email_key" ON "User"("tenantId", "email");

CREATE INDEX "RefreshToken_userId_idx" ON "RefreshToken"("userId");
CREATE INDEX "RefreshToken_expiresAt_idx" ON "RefreshToken"("expiresAt");

CREATE UNIQUE INDEX "Tenant_schoolCode_key" ON "Tenant"("schoolCode");
CREATE INDEX "Tenant_district_zone_idx" ON "Tenant"("district", "zone");
CREATE INDEX "Tenant_schoolType_idx" ON "Tenant"("schoolType");
CREATE INDEX "Tenant_isActive_idx" ON "Tenant"("isActive");

CREATE INDEX "AcademicYear_active_idx" ON "AcademicYear"("active");
CREATE UNIQUE INDEX "AcademicYear_label_key" ON "AcademicYear"("label");

CREATE INDEX "AuditLog_tenantId_idx" ON "AuditLog"("tenantId");
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");
CREATE INDEX "AuditLog_actionCode_idx" ON "AuditLog"("actionCode");
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- =========================================================
-- 4. FOREIGN KEYS
-- =========================================================

ALTER TABLE "StudentProfile"
ADD CONSTRAINT "StudentProfile_tenantId_fkey"
FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "StudentGradeClass"
ADD CONSTRAINT "StudentGradeClass_studentId_fkey"
FOREIGN KEY ("studentId") REFERENCES "StudentProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "StudentGradeClass"
ADD CONSTRAINT "StudentGradeClass_gradeId_fkey"
FOREIGN KEY ("gradeId") REFERENCES "Grade"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "StudentGradeClass"
ADD CONSTRAINT "StudentGradeClass_classId_fkey"
FOREIGN KEY ("classId") REFERENCES "Classroom"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "StudentGradeClass"
ADD CONSTRAINT "StudentGradeClass_academicYearId_fkey"
FOREIGN KEY ("academicYearId") REFERENCES "AcademicYear"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Grade"
ADD CONSTRAINT "Grade_tenantId_fkey"
FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Grade"
ADD CONSTRAINT "Grade_academicYearId_fkey"
FOREIGN KEY ("academicYearId") REFERENCES "AcademicYear"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Classroom"
ADD CONSTRAINT "Classroom_gradeId_fkey"
FOREIGN KEY ("gradeId") REFERENCES "Grade"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Classroom"
ADD CONSTRAINT "Classroom_tenantId_fkey"
FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "TeacherProfile"
ADD CONSTRAINT "TeacherProfile_tenantId_fkey"
FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "TeacherProfile"
ADD CONSTRAINT "TeacherProfile_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "TeacherGradeClass"
ADD CONSTRAINT "TeacherGradeClass_teacherId_fkey"
FOREIGN KEY ("teacherId") REFERENCES "TeacherProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "TeacherGradeClass"
ADD CONSTRAINT "TeacherGradeClass_gradeId_fkey"
FOREIGN KEY ("gradeId") REFERENCES "Grade"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "TeacherGradeClass"
ADD CONSTRAINT "TeacherGradeClass_classId_fkey"
FOREIGN KEY ("classId") REFERENCES "Classroom"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "TeacherGradeClass"
ADD CONSTRAINT "TeacherGradeClass_academicYearId_fkey"
FOREIGN KEY ("academicYearId") REFERENCES "AcademicYear"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "TeacherGradeClass"
ADD CONSTRAINT "TeacherGradeClass_subjectId_fkey"
FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Subject"
ADD CONSTRAINT "Subject_tenantId_fkey"
FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "TeacherSubject"
ADD CONSTRAINT "TeacherSubject_tenantId_fkey"
FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "TeacherSubject"
ADD CONSTRAINT "TeacherSubject_teacherId_fkey"
FOREIGN KEY ("teacherId") REFERENCES "TeacherProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "TeacherSubject"
ADD CONSTRAINT "TeacherSubject_subjectId_fkey"
FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Parent"
ADD CONSTRAINT "Parent_tenantId_fkey"
FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Parent"
ADD CONSTRAINT "Parent_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "StudentParent"
ADD CONSTRAINT "StudentParent_tenantId_fkey"
FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "StudentParent"
ADD CONSTRAINT "StudentParent_studentId_fkey"
FOREIGN KEY ("studentId") REFERENCES "StudentProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "StudentParent"
ADD CONSTRAINT "StudentParent_parentId_fkey"
FOREIGN KEY ("parentId") REFERENCES "Parent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Attendance"
ADD CONSTRAINT "Attendance_tenantId_fkey"
FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Attendance"
ADD CONSTRAINT "Attendance_studentId_fkey"
FOREIGN KEY ("studentId") REFERENCES "StudentProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Attendance"
ADD CONSTRAINT "Attendance_classId_fkey"
FOREIGN KEY ("classId") REFERENCES "Classroom"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Attendance"
ADD CONSTRAINT "Attendance_academicYearId_fkey"
FOREIGN KEY ("academicYearId") REFERENCES "AcademicYear"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Attendance"
ADD CONSTRAINT "Attendance_markedByTeacherId_fkey"
FOREIGN KEY ("markedByTeacherId") REFERENCES "TeacherProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "User"
ADD CONSTRAINT "User_tenantId_fkey"
FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "RefreshToken"
ADD CONSTRAINT "RefreshToken_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "AuditLog"
ADD CONSTRAINT "AuditLog_tenantId_fkey"
FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "AuditLog"
ADD CONSTRAINT "AuditLog_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- =========================================================
-- 5. ROW LEVEL SECURITY (RLS) - PRODUCTION READY
-- =========================================================

-- Enable + FORCE RLS on all tenant-scoped tables
ALTER TABLE "StudentProfile"     ENABLE ROW LEVEL SECURITY; ALTER TABLE "StudentProfile"     FORCE ROW LEVEL SECURITY;
ALTER TABLE "StudentGradeClass"  ENABLE ROW LEVEL SECURITY; ALTER TABLE "StudentGradeClass"  FORCE ROW LEVEL SECURITY;
ALTER TABLE "TeacherProfile"     ENABLE ROW LEVEL SECURITY; ALTER TABLE "TeacherProfile"     FORCE ROW LEVEL SECURITY;
ALTER TABLE "TeacherGradeClass"  ENABLE ROW LEVEL SECURITY; ALTER TABLE "TeacherGradeClass"  FORCE ROW LEVEL SECURITY;
ALTER TABLE "Grade"              ENABLE ROW LEVEL SECURITY; ALTER TABLE "Grade"              FORCE ROW LEVEL SECURITY;
ALTER TABLE "Classroom"          ENABLE ROW LEVEL SECURITY; ALTER TABLE "Classroom"          FORCE ROW LEVEL SECURITY;
ALTER TABLE "Subject"            ENABLE ROW LEVEL SECURITY; ALTER TABLE "Subject"            FORCE ROW LEVEL SECURITY;
ALTER TABLE "TeacherSubject"     ENABLE ROW LEVEL SECURITY; ALTER TABLE "TeacherSubject"     FORCE ROW LEVEL SECURITY;
ALTER TABLE "Parent"             ENABLE ROW LEVEL SECURITY; ALTER TABLE "Parent"             FORCE ROW LEVEL SECURITY;
ALTER TABLE "StudentParent"      ENABLE ROW LEVEL SECURITY; ALTER TABLE "StudentParent"      FORCE ROW LEVEL SECURITY;
ALTER TABLE "Attendance"         ENABLE ROW LEVEL SECURITY; ALTER TABLE "Attendance"         FORCE ROW LEVEL SECURITY;
ALTER TABLE "User"               ENABLE ROW LEVEL SECURITY; ALTER TABLE "User"               FORCE ROW LEVEL SECURITY;
ALTER TABLE "RefreshToken"       ENABLE ROW LEVEL SECURITY; ALTER TABLE "RefreshToken"       FORCE ROW LEVEL SECURITY;
ALTER TABLE "AuditLog"           ENABLE ROW LEVEL SECURITY; ALTER TABLE "AuditLog"           FORCE ROW LEVEL SECURITY;

-- ---------------------------------------------------------
-- 5.1 STUDENT PROFILE
-- ---------------------------------------------------------
CREATE POLICY student_isolation ON "StudentProfile"
    FOR ALL
    USING ("tenantId" = current_setting('app.tenant_id', true)::text)
    WITH CHECK ("tenantId" = current_setting('app.tenant_id', true)::text);

CREATE POLICY student_super_admin ON "StudentProfile"
    FOR ALL
    USING (current_setting('app.role', true) = 'SUPER_ADMIN');

-- ---------------------------------------------------------
-- 5.2 TEACHER PROFILE
-- ---------------------------------------------------------
CREATE POLICY teacher_isolation ON "TeacherProfile"
    FOR ALL
    USING ("tenantId" = current_setting('app.tenant_id', true)::text)
    WITH CHECK ("tenantId" = current_setting('app.tenant_id', true)::text);

CREATE POLICY teacher_super_admin ON "TeacherProfile"
    FOR ALL
    USING (current_setting('app.role', true) = 'SUPER_ADMIN');

-- ---------------------------------------------------------
-- 5.3 GRADE & CLASSROOM & SUBJECT
-- ---------------------------------------------------------
CREATE POLICY grade_isolation ON "Grade"
    FOR ALL
    USING ("tenantId" = current_setting('app.tenant_id', true)::text)
    WITH CHECK ("tenantId" = current_setting('app.tenant_id', true)::text);

CREATE POLICY grade_super_admin ON "Grade"
    FOR ALL
    USING (current_setting('app.role', true) = 'SUPER_ADMIN');

CREATE POLICY classroom_isolation ON "Classroom"
    FOR ALL
    USING ("tenantId" = current_setting('app.tenant_id', true)::text)
    WITH CHECK ("tenantId" = current_setting('app.tenant_id', true)::text);

CREATE POLICY classroom_super_admin ON "Classroom"
    FOR ALL
    USING (current_setting('app.role', true) = 'SUPER_ADMIN');

CREATE POLICY subject_isolation ON "Subject"
    FOR ALL
    USING ("tenantId" = current_setting('app.tenant_id', true)::text)
    WITH CHECK ("tenantId" = current_setting('app.tenant_id', true)::text);

CREATE POLICY subject_super_admin ON "Subject"
    FOR ALL
    USING (current_setting('app.role', true) = 'SUPER_ADMIN');

-- ---------------------------------------------------------
-- 5.4 JUNCTION TABLES WITH tenantId (TeacherSubject, StudentParent)
-- ---------------------------------------------------------
CREATE POLICY teacher_subject_isolation ON "TeacherSubject"
    FOR ALL
    USING ("tenantId" = current_setting('app.tenant_id', true)::text)
    WITH CHECK ("tenantId" = current_setting('app.tenant_id', true)::text);

CREATE POLICY teacher_subject_super_admin ON "TeacherSubject"
    FOR ALL
    USING (current_setting('app.role', true) = 'SUPER_ADMIN');

CREATE POLICY student_parent_isolation ON "StudentParent"
    FOR ALL
    USING ("tenantId" = current_setting('app.tenant_id', true)::text)
    WITH CHECK ("tenantId" = current_setting('app.tenant_id', true)::text);

CREATE POLICY student_parent_super_admin ON "StudentParent"
    FOR ALL
    USING (current_setting('app.role', true) = 'SUPER_ADMIN');

-- ---------------------------------------------------------
-- 5.5 JUNCTION TABLES WITHOUT tenantId (StudentGradeClass, TeacherGradeClass)
--      Isolation via join to StudentProfile / TeacherProfile
-- ---------------------------------------------------------
CREATE POLICY student_grade_class_isolation ON "StudentGradeClass"
    FOR ALL
    USING (
        EXISTS (
            SELECT 1
            FROM "StudentProfile" s
            WHERE s.id = "StudentGradeClass"."studentId"
              AND s."tenantId" = current_setting('app.tenant_id', true)::text
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM "StudentProfile" s
            WHERE s.id = "StudentGradeClass"."studentId"
              AND s."tenantId" = current_setting('app.tenant_id', true)::text
        )
    );

CREATE POLICY student_grade_class_super_admin ON "StudentGradeClass"
    FOR ALL
    USING (current_setting('app.role', true) = 'SUPER_ADMIN');

CREATE POLICY teacher_grade_class_isolation ON "TeacherGradeClass"
    FOR ALL
    USING (
        EXISTS (
            SELECT 1
            FROM "TeacherProfile" t
            WHERE t.id = "TeacherGradeClass"."teacherId"
              AND t."tenantId" = current_setting('app.tenant_id', true)::text
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM "TeacherProfile" t
            WHERE t.id = "TeacherGradeClass"."teacherId"
              AND t."tenantId" = current_setting('app.tenant_id', true)::text
        )
    );

CREATE POLICY teacher_grade_class_super_admin ON "TeacherGradeClass"
    FOR ALL
    USING (current_setting('app.role', true) = 'SUPER_ADMIN');

-- ---------------------------------------------------------
-- 5.6 PARENTS & ATTENDANCE
-- ---------------------------------------------------------
CREATE POLICY parent_isolation ON "Parent"
    FOR ALL
    USING ("tenantId" = current_setting('app.tenant_id', true)::text)
    WITH CHECK ("tenantId" = current_setting('app.tenant_id', true)::text);

CREATE POLICY parent_super_admin ON "Parent"
    FOR ALL
    USING (current_setting('app.role', true) = 'SUPER_ADMIN');

CREATE POLICY attendance_isolation ON "Attendance"
    FOR ALL
    USING ("tenantId" = current_setting('app.tenant_id', true)::text)
    WITH CHECK ("tenantId" = current_setting('app.tenant_id', true)::text);

CREATE POLICY attendance_super_admin ON "Attendance"
    FOR ALL
    USING (current_setting('app.role', true) = 'SUPER_ADMIN');

-- ---------------------------------------------------------
-- 5.7 AUDIT LOGS (Tenant can SELECT/INSERT only; SUPER_ADMIN full)
-- ---------------------------------------------------------
CREATE POLICY audit_tenant_select ON "AuditLog"
    FOR SELECT
    USING ("tenantId" = current_setting('app.tenant_id', true)::text);

CREATE POLICY audit_tenant_insert ON "AuditLog"
    FOR INSERT
    WITH CHECK ("tenantId" = current_setting('app.tenant_id', true)::text);

CREATE POLICY audit_super_admin ON "AuditLog"
    FOR ALL
    USING (current_setting('app.role', true) = 'SUPER_ADMIN');

-- ---------------------------------------------------------
-- 5.8 USERS (Identity Protection)
-- ---------------------------------------------------------
CREATE POLICY user_isolation ON "User"
    FOR ALL
    USING (
        "tenantId" = current_setting('app.tenant_id', true)::text
        OR id = current_setting('app.user_id', true)::text
    )
    WITH CHECK (
        "tenantId" = current_setting('app.tenant_id', true)::text
    );

CREATE POLICY user_super_admin ON "User"
    FOR ALL
    USING (current_setting('app.role', true) = 'SUPER_ADMIN');

-- ---------------------------------------------------------
-- 5.9 REFRESH TOKENS (Only owner or SUPER_ADMIN)
-- ---------------------------------------------------------
CREATE POLICY refresh_token_isolation ON "RefreshToken"
    FOR ALL
    USING (
        "userId" = current_setting('app.user_id', true)::text
    )
    WITH CHECK (
        "userId" = current_setting('app.user_id', true)::text
    );

CREATE POLICY refresh_token_super_admin ON "RefreshToken"
    FOR ALL
    USING (current_setting('app.role', true) = 'SUPER_ADMIN');
