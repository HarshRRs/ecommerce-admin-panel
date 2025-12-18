import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import * as dotenv from 'dotenv';
dotenv.config();

import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';

describe('Data Isolation (e2e)', () => {
    let app: INestApplication;
    let prisma: PrismaService;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();
        prisma = app.get<PrismaService>(PrismaService);
    });

    afterAll(async () => {
        // Cleanup
        const testEmails = ['ownerA@test.com', 'ownerB@test.com'];
        const testStoreSlugs = ['store-aisolation', 'store-bisolation'];

        await prisma.user.deleteMany({ where: { email: { in: testEmails } } });
        await prisma.product.deleteMany({ where: { store: { slug: { in: testStoreSlugs } } } });
        await prisma.store.deleteMany({ where: { slug: { in: testStoreSlugs } } });

        await app.close();
    });

    it('Store Owner A should NOT be able to access Store Owner B products', async () => {
        // 1. Setup Store A & User A
        const storeA = await prisma.store.create({
            data: { name: 'Store A', slug: 'store-aisolation', ownerId: 'temp-owner-a' },
        });
        const password = await bcrypt.hash('password123', 12);
        await prisma.user.create({
            data: {
                email: 'ownerA@test.com',
                password,
                role: 'OWNER',
                storeId: storeA.id,
                firstName: 'Owner',
                lastName: 'A'
            },
        });

        // 2. Setup Store B & Product B
        const storeB = await prisma.store.create({
            data: { name: 'Store B', slug: 'store-bisolation', ownerId: 'temp-owner-b' },
        });
        const productB = await prisma.product.create({
            data: {
                name: 'Product B',
                sku: 'ISOLATION-B-001',
                basePrice: 100,
                storeId: storeB.id,
                slug: 'product-b-isolation'
            },
        });

        // 3. Login as User A
        const loginRes = await request(app.getHttpServer())
            .post('/auth/login')
            .send({ email: 'ownerA@test.com', password: 'password123' });

        const token = loginRes.body.access_token;
        expect(token).toBeDefined();

        // 4. Try to access Product B
        const res = await request(app.getHttpServer())
            .get(`/products/${productB.id}`)
            .set('Authorization', `Bearer ${token}`);

        // findOne in service returns 404 if not found in that storeId
        expect(res.status).toBe(404);
    });
});
