module.exports = {
  application: {
    port: null,
    env: 'test',
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
