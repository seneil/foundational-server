module.exports = {
  application: {
    port: 3001,
    env: 'deployment',
  },
  mongodb: {
    uri: 'mongodb://127.0.0.1:27017/note-keeper',
  },
  jwt: {
    issuer: 'default-issuer',
    hashLength: 128,
    saltLength: 128,
    expiresIn: '3 days',
    hashIterations: 100000,
    secretOrKey: 'default-secret',
  },
};
