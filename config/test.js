const path = require('path');

module.exports = {
  application: {
    port: null,
    env: 'test',
  },
  attachment: {
    quality: 85,
    folderLength: 10,
    filenameLength: 10,
    salt: 'default-secret',
    storage: path.resolve(__dirname, '../', 'storage'),
  },
  mongodb: {
    uri: 'mongodb://127.0.0.1:27017/note-keeper-test',
  },
  jwt: {
    issuer: 'default-issuer',
    hashLength: 128,
    saltLength: 128,
    expiresIn: '1 days',
    hashIterations: 1000,
    secretOrKey: 'default-secret',
  },
};
