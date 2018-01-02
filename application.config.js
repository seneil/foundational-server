const { SECRET_KEY = 'local-secret', ISSUER = 'local-issuer' } = process.env;

module.exports = {
  account: {
    issuer: ISSUER,
    hashLength: 128,
    saltLength: 128,
    expiresIn: '2 days',
    hashIterations: 100000,
    secretOrKey: SECRET_KEY,
  },
};
