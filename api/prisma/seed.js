// prisma/seed.ts
import 'dotenv/config';
import { PrismaClient, UserRole, SchoolType, SchoolMedium } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  // -------------------------------------------
  // 1. Load config from .env
  // -------------------------------------------
  const superAdminEmail =
    process.env.SEED_SUPER_ADMIN_EMAIL || "superadmin@eduverse.local";
  const superAdminPassword =
    process.env.SEED_SUPER_ADMIN_PASSWORD || "SuperAdmin@123";

  const schoolAdminEmail =
    process.env.SEED_SCHOOL_ADMIN_EMAIL || "schooladmin@demo.edu";
  const schoolAdminPassword =
    process.env.SEED_SCHOOL_ADMIN_PASSWORD || "SchoolAdmin@123";

  const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS) || 12;

  // -------------------------------------------
  // 2. Hash passwords
  // -------------------------------------------
  const superAdminHash = await bcrypt.hash(superAdminPassword, saltRounds);
  const schoolAdminHash = await bcrypt.hash(schoolAdminPassword, saltRounds);

  // -------------------------------------------
  // 3. Create Tenant
  // -------------------------------------------
  const tenant = await prisma.tenant.upsert({
    where: { schoolCode: "SCH-0001" },
    update: {},
    create: {
      name: "Demo National School",
      schoolCode: "SCH-0001",
      schoolType: SchoolType.ONE_AB,
      province: "Western",
      district: "Colombo",
      zone: "Colombo",
      division: "Colombo",
      mediums: [SchoolMedium.SINHALA, SchoolMedium.ENGLISH],
      addressLine1: "123, Main Road",
      city: "Colombo",
    },
  });

  console.log("✅ Tenant created:", tenant.name);

  // -------------------------------------------
  //  Create Teachers
  // -------------------------------------------

  console.log('👨‍🏫 Seeding Teachers...');

  const teachersData = [
    { fullName: 'I S Vithanage', subject: 'Science', gender: 'MALE' },
    { fullName: 'Sandaru Vithanage', subject: 'Maths', gender: 'MALE' },
    { fullName: 'Induwara Vithanage', subject: 'ICT', gender: 'MALE' },
    { fullName: 'Induwara Sandaru', subject: 'History', gender: 'MALE' },
  ];

  for (let i = 0; i < teachersData.length; i++) {
    const teacher = teachersData[i];
    // Generate unique dummy IDs based on index
    const dummyNIC = `2003${500 + i}00${i}V`; 
    const dummyTIN = `TIN-${1000 + i}`;

    await prisma.teacherProfile.create({
      data: {
        fullName: teacher.fullName,
        // Link to the tenant created earlier
        tenantId: tenant.id, 
        
        // Required Unique Fields
        nic: dummyNIC,
        tin: dummyTIN,
        
        // Subjects (stored as Array of Strings)
        subjectCodes: [teacher.subject], 
        
        // Enums & Dates (Defaulting for Seed)
        appointmentType: 'PERMANENT', 
        employmentStatus: 'ACTIVE',
        serviceStart: new Date(),
        dateOfBirth: new Date('2003-08-06'),
        gender: teacher.gender,
        religion: 'BUDDHIST',
        ethnicity: 'SINHALA',
        motherTongue: 'SINHALA',
      },
    });
  }

  console.log(`✅ Added ${teachersData.length} teachers successfully.`);

  console.log('🎓 Seeding Students...');

  const studentsData = [
    { fullName: 'Kavindu Perera', gender: 'MALE', index: 'IDX-001', adm: 'ADM-001' },
    { fullName: 'Amaya Silva', gender: 'FEMALE', index: 'IDX-002', adm: 'ADM-002' },
    { fullName: 'Nimali Fernando', gender: 'FEMALE', index: 'IDX-003', adm: 'ADM-003' },
    { fullName: 'Ruwan Jayasinghe', gender: 'MALE', index: 'IDX-004', adm: 'ADM-004' },
  ];

  for (const s of studentsData) {
    await prisma.studentProfile.create({
      data: {
        tenantId: tenant.id,
        fullName: s.fullName,
        initials: s.fullName.split(' ').map(n => n[0]).join('. '),
        dateOfBirth: new Date('2010-05-15'),
        gender: s.gender,
        
        // NEMIS Requirements
        indexNumber: s.index,
        admissionNumber: s.adm,
        admissionDate: new Date(),
        
        // Demographics (Defaults for seed)
        motherTongue: 'SINHALA',
        religion: 'BUDDHIST',
        ethnicity: 'SINHALA',
        
        isActive: true,
      },
    });
  }

  console.log(`✅ Added ${studentsData.length} students successfully.`);

  // -------------------------------------------
  // 4. Create Academic Year
  // -------------------------------------------
  const academicYear = await prisma.academicYear.upsert({
    where: { label: "2025/2026" },
    update: {},
    create: {
      label: "2025/2026",
      numericYear: 2025,
      start: new Date("2025-01-01"),
      end: new Date("2025-12-31"),
      active: true,
    },
  });

  console.log("✅ AcademicYear created:", academicYear.label);

  // -------------------------------------------
  // 5. Create Grades 1..13
  // -------------------------------------------
  const grades = [];

  for (let gradeNumber = 1; gradeNumber <= 13; gradeNumber++) {
    const grade = await prisma.grade.upsert({
      where: {
        tenantId_gradeNumber: {
          tenantId: tenant.id,
          gradeNumber,
        },
      },
      update: {},
      create: {
        gradeNumber,
        name: `Grade ${gradeNumber}`,
        tenantId: tenant.id,
        academicYearId: academicYear.id,
      },
    });

    grades.push(grade);
  }

  console.log(`✅ ${grades.length} grades created`);

  // -------------------------------------------
  // 6. Sample classrooms
  // -------------------------------------------
  const grade6 = grades.find((g) => g.gradeNumber === 6);
  const grade10 = grades.find((g) => g.gradeNumber === 10);

  if (grade6) {
    await prisma.classroom.upsert({
      where: { tenantId_classCode: { tenantId: tenant.id, classCode: "6A" } },
      update: {},
      create: {
        tenantId: tenant.id,
        gradeId: grade6.id,
        className: "A",
        classCode: "6A",
        capacity: 35,
      },
    });

    await prisma.classroom.upsert({
      where: { tenantId_classCode: { tenantId: tenant.id, classCode: "6B" } },
      update: {},
      create: {
        tenantId: tenant.id,
        gradeId: grade6.id,
        className: "B",
        classCode: "6B",
        capacity: 35,
      },
    });
  }

  if (grade10) {
    await prisma.classroom.upsert({
      where: { tenantId_classCode: { tenantId: tenant.id, classCode: "10A" } },
      update: {},
      create: {
        tenantId: tenant.id,
        gradeId: grade10.id,
        className: "A",
        classCode: "10A",
        capacity: 40,
      },
    });
  }

  console.log("✅ Sample classrooms created");

  // -------------------------------------------
  // 7. SUPER_ADMIN (tenantId must be NULL)
  // -------------------------------------------
  let superAdmin = await prisma.user.findFirst({
    where: {
      email: superAdminEmail,
      tenantId: null,
    },
  });

  if (!superAdmin) {
    superAdmin = await prisma.user.create({
      data: {
        tenantId: null,
        email: superAdminEmail,
        passwordHash: superAdminHash,
        role: UserRole.SUPER_ADMIN,
        isActive: true,
      },
    });
  }

  console.log("✅ SUPER_ADMIN created:", superAdmin.email);

  // -------------------------------------------
  // 8. SCHOOL_ADMIN
  // -------------------------------------------
  const schoolAdmin = await prisma.user.upsert({
    where: {
      tenantId_email: {
        tenantId: tenant.id,
        email: schoolAdminEmail,
      },
    },
    update: {},
    create: {
      tenantId: tenant.id,
      email: schoolAdminEmail,
      passwordHash: schoolAdminHash,
      role: UserRole.SCHOOL_ADMIN,
      isActive: true,
    },
  });

  console.log("✅ SCHOOL_ADMIN created:", schoolAdmin.email);

  console.log("🌱 Seed complete!");
}

// ---- Run it ----
main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
