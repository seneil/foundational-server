const mongoose = require('mongoose');

const passport = require('passport');
const passportJWT = require('passport-jwt');

const { jwtOptions } = require('../passport-jwt/services');

const accountSchema = require('../../schemas/account.schema');

const JwtStrategy = passportJWT.Strategy;
const Account = mongoose.model('Account', accountSchema);

const strategy = new JwtStrategy(jwtOptions, (payload, next) => {
  const { identity } = payload;

  Account.findById(identity, { username: 1, email: 1, privilege: 1 })
    .then(account => {
      if (account) {
        return next(null, account);
      }

      return next(null, false);
    });
});

passport.use(strategy);

module.exports = passport;
