import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as argon2 from 'argon2';
import { config } from 'dotenv';

import { usersTable, profilesTable, passportTable } from '../schema';

import type { Gender } from '../schema/_enums';

config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool);

async function seed() {
  try {
    console.log('🌱 Seeding data...');

    const adminPassword = await argon2.hash('admin123');
    const userPassword = await argon2.hash('user123');

    const [admin, user] = await db
      .insert(usersTable)
      .values([
        {
          email: 'admin@example.com',
          password: adminPassword,
          role: 'admin',
          isEmailVerified: true,
          isActive: true,
          lastLoginAt: new Date(),
        },
        {
          email: 'user@example.com',
          password: userPassword,
          role: 'user',
          isEmailVerified: true,
          isActive: true,
          lastLoginAt: new Date(),
        },
      ])
      .returning();

    if (!admin || !user) {
      throw new Error('Failed to create users');
    }

    await db.insert(profilesTable).values([
      {
        userId: admin.id,
        displayName: 'Admin User',
        gender: 'MALE' as Gender,
        phoneNumber: '+1234567890',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
        dateOfBirth: new Date('1990-01-01'),
        address: '123 Admin Street',
      },
      {
        userId: user.id,
        displayName: 'Regular User',
        gender: 'FEMALE' as Gender,
        phoneNumber: '+0987654321',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=other',
        dateOfBirth: new Date('1995-01-01'),
        address: '456 User Avenue',
      },
    ]);

    await db.insert(passportTable).values([
      {
        userId: admin.id,
        ip: '192.168.1.1',
        location: 'New York, USA',
        deviceOs: 'macOS',
        deviceName: 'MacBook Pro',
        deviceType: 'desktop',
        browser: 'Chrome',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        refreshToken: await argon2.hash('admin-refresh-token'),
      },
      {
        userId: user.id,
        ip: '192.168.1.2',
        location: 'Los Angeles, USA',
        deviceOs: 'Windows',
        deviceName: 'Desktop PC',
        deviceType: 'desktop',
        browser: 'Firefox',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        refreshToken: await argon2.hash('user-refresh-token'),
      },
    ]);

    console.log('✅ Seeding data completed!');
    console.log('👤 Admin account: admin@example.com / admin123');
    console.log('👤 User account: user@example.com / user123');
  } catch (error) {
    console.error('❌ Seeding data failed:', error);
  } finally {
    await pool.end();
  }
}

seed().catch(console.error);
