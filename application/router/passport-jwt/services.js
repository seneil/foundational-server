const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const passportJWT = require('passport-jwt');

const config = require('../../../application.config');

const ExtractJwt = passportJWT.ExtractJwt;

const accountServices = {
  jwtOptions: {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken('jwt'),
    secretOrKey: config.account.secretOrKey,
    ignoreExpiration: false,
  },

  generatePasswordHash: password => {
    const { hashIterations, saltLength, hashLength } = config.account;

    const salt = crypto.randomBytes(saltLength)
      .toString('base64');

    const hash = crypto.pbkdf2Sync(password, salt, hashIterations, hashLength, 'sha512')
      .toString('hex');

    return { salt, hash };
  },

  verifyPasswordHash: (password, hash, salt) => {
    const { hashIterations, hashLength } = config.account;

    return hash === crypto.pbkdf2Sync(password, salt, hashIterations, hashLength, 'sha512')
      .toString('hex');
  },

  jwtSign: payload => jwt.sign(payload, accountServices.jwtOptions.secretOrKey, {
    expiresIn: config.account.expiresIn,
    issuer: config.account.issuer,
  }),
};

module.exports = accountServices;
