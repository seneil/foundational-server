module.exports = {
  application: {
    port: 3001,
    env: 'staging',
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
