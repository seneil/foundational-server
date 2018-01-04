const config = require('config');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const passportJWT = require('passport-jwt');

const jwtConfig = config.get('jwt');

const ExtractJwt = passportJWT.ExtractJwt;

const accountServices = {
  jwtOptions: {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken('jwt'),
    secretOrKey: jwtConfig.secretOrKey,
    ignoreExpiration: false,
  },

  generatePasswordHash: password => {
    const { hashIterations, saltLength, hashLength } = jwtConfig;

    const salt = crypto.randomBytes(saltLength)
      .toString('base64');

    const hash = crypto.pbkdf2Sync(password, salt, hashIterations, hashLength, 'sha512')
      .toString('hex');

    return { salt, hash };
  },

  verifyPasswordHash: (password, hash, salt) => {
    const { hashIterations, hashLength } = jwtConfig;

    return hash === crypto.pbkdf2Sync(password, salt, hashIterations, hashLength, 'sha512')
      .toString('hex');
  },

  jwtSign: payload => jwt.sign(payload, accountServices.jwtOptions.secretOrKey, {
    expiresIn: jwtConfig.expiresIn,
    issuer: jwtConfig.issuer,
  }),
};

module.exports = accountServices;
