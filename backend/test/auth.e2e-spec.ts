import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/prisma/prisma.service';

describe('Authentication (e2e)', () => {
    let app: INestApplication;
    let prisma: PrismaService;

    // Unique identifiers for this test run
    const timestamp = Date.now();
    const testUser = {
        email: `e2e_user_${timestamp}@test.com`,
        password: 'Password123!',
        firstName: 'E2E',
        lastName: 'Tester',
        storeName: `E2E Store ${timestamp}`,
        storeSlug: `e2e-store-${timestamp}`,
    };

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();

        prisma = app.get<PrismaService>(PrismaService);
    });

    afterAll(async () => {
        // Cleanup using unique email and slug
        try {
            // Deleting the store should cascade delete the user if set up that way, 
            // but let's be safe and delete user specifically if needed.
            // Based on schema: Store ownerId is just a string, it might not cascade from User?
            // Actually schema says: Store -> User[] (storeId).
            // Let's delete Store first.

            const store = await prisma.store.findUnique({ where: { slug: testUser.storeSlug } });
            if (store) {
                await prisma.store.delete({ where: { id: store.id } });
            }

            // Clean up user if not deleted by store cascade (which is likely true as User has storeId FK)
            const user = await prisma.user.findUnique({ where: { email: testUser.email } });
            if (user) {
                await prisma.user.delete({ where: { id: user.id } });
            }
        } catch (e) {
            console.error('Cleanup failed', e);
        }

        await app.close();
    });

    it('/auth/register/store (POST) - should register a new store and owner', async () => {
        const response = await request(app.getHttpServer())
            .post('/auth/register/store')
            .send({
                email: testUser.email,
                password: testUser.password,
                firstName: testUser.firstName,
                lastName: testUser.lastName,
                storeName: testUser.storeName,
                storeSlug: testUser.storeSlug,
            });

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('access_token');
        expect(response.body).toHaveProperty('user');
        expect(response.body.user).toHaveProperty('email', testUser.email);
        expect(response.body.user).toHaveProperty('storeName', testUser.storeName);
    });

    it('/auth/login (POST) - should login with created credentials', async () => {
        const response = await request(app.getHttpServer())
            .post('/auth/login')
            .send({
                email: testUser.email,
                password: testUser.password,
            });

        expect(response.status).toBe(201); // NestJS defaults POST to 201
        expect(response.body).toHaveProperty('access_token');
        expect(response.body.user).toHaveProperty('email', testUser.email);
    });

    it('/auth/profile (GET) - should retrieve profile with valid token', async () => {
        // Login first to get token
        const loginResponse = await request(app.getHttpServer())
            .post('/auth/login')
            .send({
                email: testUser.email,
                password: testUser.password,
            });

        const token = loginResponse.body.access_token;

        const response = await request(app.getHttpServer())
            .get('/auth/profile')
            .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('email', testUser.email);
        expect(response.body).toHaveProperty('store');
        expect(response.body.store).toHaveProperty('slug', testUser.storeSlug);
    });
});
