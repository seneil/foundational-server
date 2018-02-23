const path = require('path');

module.exports = {
  application: {
    port: 3001,
    env: 'staging',
  },
  attachment: {
    quality: 85,
    folderLength: 10,
    filenameLength: 10,
    salt: 'default-secret',
    storage: path.resolve(__dirname, '../', 'storage'),
  },
  mongodb: {
    uri: 'mongodb://192.168.56.5:27017/note-keeper-scratch',
  },
  jwt: {
    issuer: 'default-issuer',
    hashLength: 128,
    saltLength: 128,
    expiresIn: '1 days',
    hashIterations: 100000,
    secretOrKey: 'default-secret',
  },
};
