import { Global, Module } from '@nestjs/common';
import {
  DrizzleAsyncProvider,
  drizzleProvider,
} from '@/database/drizzle.provider';

@Global()
@Module({
  providers: [...drizzleProvider],
  exports: [DrizzleAsyncProvider],
})
export class DrizzleModule {}
