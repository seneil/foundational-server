const mongoose = require('mongoose');
const application = require('requirefrom')('application');
const controllers = require('requirefrom')('application/controllers');
const constants = require('requirefrom')('application/common/constants');

const { jwtSign, verifyPasswordHash } = controllers('passport-jwt/services');
const { CODES: { NOT_FOUND } } = constants();
const { accountSchema } = application('schemas');

const Account = mongoose.model('Account', accountSchema);

module.exports = async(email, password) => {
  const account = await Account.findOne({ email });

  if (!account) return Promise.reject(NOT_FOUND);

  const credentials = verifyPasswordHash(password, account.password, account.salt);

  if (credentials) {
    const { _id, username } = account;

    const payload = { identity: _id };
    const token = jwtSign(payload);

    const updateResult = await Account
      .findOneAndUpdate({ _id }, { $set: { lastAuth: new Date() } }, { new: true });

    return Promise.resolve({ username, token, lastAuth: updateResult.lastAuth });
  }

  return Promise.reject(NOT_FOUND);
};
