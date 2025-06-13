import { Inject } from '@nestjs/common';

import { DRIZZLE_PROVIDER } from '@/common/modules/drizzle/drizzle.provider';

export const Drizzle = () => Inject(DRIZZLE_PROVIDER);

// 用法
// @Injectable()
// export class UserService {
//   constructor(
//     @Drizzle()
//     private readonly db: NodePgDatabase<any>,
//   ) {}
// }
