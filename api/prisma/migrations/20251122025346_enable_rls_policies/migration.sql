-- 1. Enable Row Level Security
ALTER TABLE "StudentProfile" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "TeacherProfile" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Grade" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Classroom" ENABLE ROW LEVEL SECURITY;

-- 2. Create Policies
-- These rules tell Postgres: "Only show rows where tenantId matches the user's session"

-- Policy for StudentProfile
CREATE POLICY tenant_isolation_student ON "StudentProfile" FOR ALL
USING (
    current_setting('app.role', true) = 'SUPER_ADMIN' 
    OR "tenantId" = current_setting('app.tenant_id', true)
);

-- Policy for TeacherProfile
CREATE POLICY tenant_isolation_teacher ON "TeacherProfile" FOR ALL
USING (
    current_setting('app.role', true) = 'SUPER_ADMIN' 
    OR "tenantId" = current_setting('app.tenant_id', true)
);

-- Policy for Grade
CREATE POLICY tenant_isolation_grade ON "Grade" FOR ALL
USING (
    current_setting('app.role', true) = 'SUPER_ADMIN' 
    OR "tenantId" = current_setting('app.tenant_id', true)
);

-- Policy for Classroom
CREATE POLICY tenant_isolation_classroom ON "Classroom" FOR ALL
USING (
    current_setting('app.role', true) = 'SUPER_ADMIN' 
    OR "tenantId" = current_setting('app.tenant_id', true)
);