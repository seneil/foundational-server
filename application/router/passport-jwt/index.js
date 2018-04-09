const mongoose = require('mongoose');
const passport = require('passport');
const passportJWT = require('passport-jwt');
const application = require('requirefrom')('application');

const { jwtOptions } = require('../passport-jwt/services');

const accountSchema = application('schemas/account.schema');
const Account = mongoose.model('Account', accountSchema);

const JwtStrategy = passportJWT.Strategy;

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
