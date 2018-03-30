const READER = 'reader';
const WRITER = 'writer';
const MANAGER = 'manager';
const OWNER = 'owner';

const STAGING = 'staging';
const DEVELOPMENT = 'development';
const DEPLOYMENT = 'deployment';

module.exports = {
  READER,
  WRITER,
  MANAGER,
  OWNER,
  WRITE_PRIVILEGES: [WRITER, MANAGER, OWNER],
  MANAGER_PRIVILEGES: [MANAGER, OWNER],
  ENV: {
    STAGING,
    DEVELOPMENT,
    DEPLOYMENT,
  },
};
