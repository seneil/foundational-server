const mongoose = require('mongoose');
const passport = require('passport');
const passportJWT = require('passport-jwt');
const application = require('requirefrom')('application');
const { jwtOptions } = require('./services');

const { accountSchema } = application('schemas');

const Account = mongoose.model('Account', accountSchema);

const JwtStrategy = passportJWT.Strategy;

const strategy = new JwtStrategy(jwtOptions, async(payload, next) => {
  const { identity } = payload;

  const account = await Account
    .findById(identity, { username: 1, email: 1, privilege: 1 });

  if (account) return next(null, account);

  return next(null, false);
});

passport.use(strategy);

module.exports = passport;
