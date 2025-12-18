import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting production seed...');

    // Check if super admin already exists
    const existingAdmin = await prisma.user.findUnique({
        where: { email: 'admin@example.com' },
    });

    if (existingAdmin) {
        console.log('✅ Super admin already exists');
        return;
    }

    // Create super admin user
    const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'admin123', 12);

    const superAdmin = await prisma.user.create({
        data: {
            email: process.env.ADMIN_EMAIL || 'admin@example.com',
            password: hashedPassword,
            firstName: 'Super',
            lastName: 'Admin',
            role: 'SUPER_ADMIN',
            isActive: true,
        },
    });

    console.log('✅ Created super admin:', superAdmin.email);
    console.log('');
    console.log('🎉 Production seed completed successfully!');
}

main()
    .catch((e) => {
        console.error('❌ Seeed failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
