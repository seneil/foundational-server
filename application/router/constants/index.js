const READER = 'reader';
const WRITER = 'writer';
const MANAGER = 'manager';
const OWNER = 'owner';

module.exports = {
  READER,
  WRITER,
  MANAGER,
  OWNER,
  WRITE_PRIVILEGES: [WRITER, MANAGER, OWNER],
  MANAGER_PRIVILEGES: [MANAGER, OWNER],
};
