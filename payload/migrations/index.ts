import * as migration_20261124_110731_initial from './20261124_110731_initial';
import * as migration_20261124_111611_users_roles from './20261124_111611_users_roles';
import * as migration_20261124_113402_locales from './20261124_113402_locales';
import * as migration_20261124_114041_media from './20261124_114041_media';
import * as migration_20261124_114830_pages from './20261124_114830_pages';
import * as migration_20261124_115427_site_settings from './20261124_115427_site_settings';
import * as migration_20261124_121404_seo from './20261124_121404_seo';

export const migrations = [
  {
    up: migration_20261124_110731_initial.up,
    down: migration_20261124_110731_initial.down,
    name: '20261124_110731_initial',
  },
  {
    up: migration_20261124_111611_users_roles.up,
    down: migration_20261124_111611_users_roles.down,
    name: '20261124_111611_users_roles',
  },
  {
    up: migration_20261124_113402_locales.up,
    down: migration_20261124_113402_locales.down,
    name: '20261124_113402_locales',
  },
  {
    up: migration_20261124_114041_media.up,
    down: migration_20261124_114041_media.down,
    name: '20261124_114041_media',
  },
  {
    up: migration_20261124_114830_pages.up,
    down: migration_20261124_114830_pages.down,
    name: '20261124_114830_pages',
  },
  {
    up: migration_20261124_115427_site_settings.up,
    down: migration_20261124_115427_site_settings.down,
    name: '20261124_115427_site_settings',
  },
  {
    up: migration_20261124_121404_seo.up,
    down: migration_20261124_121404_seo.down,
    name: '20261124_121404_seo'
  },
];
