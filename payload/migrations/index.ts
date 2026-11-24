import * as migration_20261124_110731_initial from './20261124_110731_initial';
import * as migration_20261124_111611_users_roles from './20261124_111611_users_roles';

export const migrations = [
  {
    up: migration_20261124_110731_initial.up,
    down: migration_20261124_110731_initial.down,
    name: '20261124_110731_initial',
  },
  {
    up: migration_20261124_111611_users_roles.up,
    down: migration_20261124_111611_users_roles.down,
    name: '20261124_111611_users_roles'
  },
];
