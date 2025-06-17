import * as enums from './_enums';
import * as users from './users';
import * as profiles from './profiles';
import * as sessions from './passport';
import * as otps from './otps';
import * as relations from './_relations';

export * from './_enums';
export * from './users';
export * from './profiles';
export * from './passport';
export * from './otps';
export * from './_relations';

export type Schema = typeof schema;

const schema = {
  ...enums,
  ...users,
  ...profiles,
  ...sessions,
  ...otps,
  ...relations,
};
export default schema;
