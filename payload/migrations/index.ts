import * as migration_20261124_110731_initial from './20261124_110731_initial';

export const migrations = [
  {
    up: migration_20261124_110731_initial.up,
    down: migration_20261124_110731_initial.down,
    name: '20261124_110731_initial'
  },
];
