import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let superAdminToken: string;
  let superAdminId: string;
  const testSuperAdminEmail = 'testsuperadmin@example.com';
  const testSuperAdminPassword = 'TestPassword@123';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();

    // 1. Create a super admin user
    const passwordHash = await bcrypt.hash(testSuperAdminPassword, 12);
    const superAdmin = await prisma.user.create({
      data: {
        email: testSuperAdminEmail,
        passwordHash,
        role: UserRole.SUPER_ADMIN,
        isActive: true,
      },
    });
    superAdminId = superAdmin.id;

    // 2. Log in as super admin to get token
    const loginRes = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: testSuperAdminEmail, password: testSuperAdminPassword })
      .expect(201);
    superAdminToken = loginRes.body.accessToken;
  });

  afterAll(async () => {
    // Clean up created user
    await prisma.user.deleteMany({
      where: { email: testSuperAdminEmail },
    });
    await app.close();
    await prisma.$disconnect();
  });

  it('/api (GET)', () => {
    return request(app.getHttpServer())
      .get('/api')
      .expect(200)
      .expect('Hello World!');
  });
});

describe('UsersController (e2e)', () => {
  let app: INestApplication;
  let superAdminToken: string;
  let superAdminId: string;
  const testSuperAdminEmail = 'testsuperadmin@example.com';
  const testSuperAdminPassword = 'TestPassword@123';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();

    // 1. Create a super admin user
    const passwordHash = await bcrypt.hash(testSuperAdminPassword, 12);
    let superAdmin = await prisma.user.findFirst({
      where: { email: testSuperAdminEmail },
    });

    if (superAdmin) {
      superAdmin = await prisma.user.update({
        where: { id: superAdmin.id },
        data: {
          passwordHash,
          role: UserRole.SUPER_ADMIN,
          isActive: true,
        },
      });
    } else {
      superAdmin = await prisma.user.create({
        data: {
          email: testSuperAdminEmail,
          passwordHash,
          role: UserRole.SUPER_ADMIN,
          isActive: true,
        },
      });
    }
    superAdminId = superAdmin.id;

    // 2. Log in as super admin to get token
    const loginRes = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: testSuperAdminEmail, password: testSuperAdminPassword })
      .expect(201);
    superAdminToken = loginRes.body.accessToken;
  });

  afterAll(async () => {
    // Clean up created user
    await prisma.user.deleteMany({
      where: { email: testSuperAdminEmail },
    });
    await app.close();
    await prisma.$disconnect();
  });

  it('should create a new user (POST /users)', async () => {
    const createUserDto = {
      email: 'newuser@example.com',
      password: 'NewUser@123',
      role: UserRole.SCHOOL_ADMIN,
    };

    const response = await request(app.getHttpServer())
      .post('/api/users')
      .set('Authorization', `Bearer ${superAdminToken}`)
      .send(createUserDto)
      .expect(201);

    expect(response.body).toMatchObject({
      email: createUserDto.email,
      role: createUserDto.role,
      isActive: true,
    });

    // Clean up the created user
    await prisma.user.delete({ where: { id: response.body.id } });
  });

  it('should return all users (GET /users)', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/users')
      .set('Authorization', `Bearer ${superAdminToken}`)
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0); // Assuming at least the super admin exists
    expect(response.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: expect.any(String),
          email: expect.any(String),
          role: expect.any(String),
        }),
      ]),
    );
  });

  it('should return a user by ID (GET /users/:id)', async () => {
    // Create a temporary user to fetch
    const tempUser = await prisma.user.create({
      data: {
        email: 'tempuser@example.com',
        passwordHash: await bcrypt.hash('TempUser@123', 12),
        role: UserRole.SCHOOL_ADMIN,
        isActive: true,
      },
    });

    const response = await request(app.getHttpServer())
      .get(`/api/users/${tempUser.id}`)
      .set('Authorization', `Bearer ${superAdminToken}`)
      .expect(200);

    expect(response.body).toMatchObject({
      id: tempUser.id,
      email: tempUser.email,
      role: tempUser.role,
    });

    // Clean up the temporary user
    await prisma.user.delete({ where: { id: tempUser.id } });
  });

  it('should update a user by ID (PATCH /users/:id)', async () => {
    // Create a temporary user to update
    const tempUser = await prisma.user.create({
      data: {
        email: 'user_to_update@example.com',
        passwordHash: await bcrypt.hash('UpdateUser@123', 12),
        role: UserRole.SCHOOL_ADMIN,
        isActive: true,
      },
    });

    const updateDto = {
      email: 'updated_user@example.com',
      isActive: false,
    };

    const response = await request(app.getHttpServer())
      .patch(`/api/users/${tempUser.id}`)
      .set('Authorization', `Bearer ${superAdminToken}`)
      .send(updateDto)
      .expect(200);

    expect(response.body).toMatchObject({
      id: tempUser.id,
      email: updateDto.email,
      isActive: updateDto.isActive,
    });

    // Clean up the temporary user
    await prisma.user.delete({ where: { id: tempUser.id } });
  });

  it("should reset a user's password by ID (PATCH /users/:id/reset-password)", async () => {
    // Create a temporary user to reset password
    const tempUser = await prisma.user.create({
      data: {
        email: 'user_to_reset@example.com',
        passwordHash: await bcrypt.hash('OldPassword@123', 12),
        role: UserRole.SCHOOL_ADMIN,
        isActive: true,
      },
    });

    const newPassword = 'NewPassword@123';
    const resetPasswordDto = {
      newPassword,
    };

    await request(app.getHttpServer())
      .patch(`/api/users/${tempUser.id}/reset-password`)
      .set('Authorization', `Bearer ${superAdminToken}`)
      .send(resetPasswordDto)
      .expect(200);

    // Verify password reset by trying to log in with the new password
    const loginRes = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: tempUser.email, password: newPassword })
      .expect(201);

    expect(loginRes.body.accessToken).toBeDefined();

    // Clean up the temporary user
    await prisma.user.delete({ where: { id: tempUser.id } });
  });
});

describe('School Data (e2e)', () => {
  let app: INestApplication;
  let superAdminToken: string;
  let superAdminId: string;
  const testSuperAdminEmail = 'testsuperadmin@example.com';
  const testSuperAdminPassword = 'TestPassword@123';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();

    // Ensure super admin exists (from previous tests setup)
    const passwordHash = await bcrypt.hash(testSuperAdminPassword, 12);
    let superAdmin = await prisma.user.findFirst({
      where: { email: testSuperAdminEmail },
    });

    if (superAdmin) {
      superAdmin = await prisma.user.update({
        where: { id: superAdmin.id },
        data: {
          passwordHash,
          role: UserRole.SUPER_ADMIN,
          isActive: true,
        },
      });
    } else {
      superAdmin = await prisma.user.create({
        data: {
          email: testSuperAdminEmail,
          passwordHash,
          role: UserRole.SUPER_ADMIN,
          isActive: true,
        },
      });
    }
    superAdminId = superAdmin.id;

    // Log in as super admin to get token
    const loginRes = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: testSuperAdminEmail, password: testSuperAdminPassword })
      .expect(201);
    superAdminToken = loginRes.body.accessToken;
  });

  afterAll(async () => {
    // Clean up created user
    await prisma.user.deleteMany({
      where: { email: testSuperAdminEmail },
    });
    await app.close();
    await prisma.$disconnect();
  });

  it('GET /api/students should return 200 OK and an array of students', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/students')
      .set('Authorization', `Bearer ${superAdminToken}`)
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0); // Assuming students are seeded
    expect(response.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: expect.any(String),
          fullName: expect.any(String),
          tenantId: expect.any(String),
          // Add other expected student properties here if needed
        }),
      ]),
    );
  });

  it('GET /api/teachers should return 200 OK and an array of teachers', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/teachers')
      .set('Authorization', `Bearer ${superAdminToken}`)
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0); // Assuming teachers are seeded
    expect(response.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: expect.any(String),
          fullName: expect.any(String),
          tenantId: expect.any(String),
          // Add other expected teacher properties here if needed
        }),
      ]),
    );
  });

  it('GET /api/students without token should return 401 Unauthorized', async () => {
    await request(app.getHttpServer())
      .get('/api/students')
      .expect(401);
  });

  it('GET /api/teachers without token should return 401 Unauthorized', async () => {
    await request(app.getHttpServer())
      .get('/api/teachers')
      .expect(401);
  });
});

