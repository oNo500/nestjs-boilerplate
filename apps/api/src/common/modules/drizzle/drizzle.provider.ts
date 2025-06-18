import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { ConfigService } from '@nestjs/config';
import schema from '@repo/db';

export const DRIZZLE_PROVIDER = 'DRIZZLE_PROVIDER';

export const drizzleProvider = [
  {
    provide: DRIZZLE_PROVIDER,
    inject: [ConfigService],
    useFactory: (configService: ConfigService) => {
      const connectionString = configService.get<string>('DATABASE_URL');
      const pool = new Pool({
        connectionString,
      });
      return drizzle(pool, { schema, casing: 'snake_case' }) as NodePgDatabase<typeof schema>;
    },
  },
];
