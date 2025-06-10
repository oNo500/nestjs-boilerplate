import * as enums from './_enums';
import * as users from './users';
import * as profiles from './profiles';
import * as sessions from './sessions';
import * as otps from './otps';
import * as relations from './_relations';

export const schema = {
  ...enums,
  ...users,
  ...profiles,
  ...sessions,
  ...otps,
  ...relations,
};

export default schema;
