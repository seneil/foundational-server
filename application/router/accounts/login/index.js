const mongoose = require('mongoose');

const { jwtSign, verifyPasswordHash } = require('../../passport-jwt/services');
const { OK, NOT_FOUND, NO_VALIDATE } = require('../../constants/server-codes');

const accountSchema = require('../../../schemas/account.schema');

const Account = mongoose.model('Account', accountSchema);

module.exports = (request, response) => {
  const { email, password } = request.body;

  if (!(email && password)) {
    return response.status(200)
      .json({
        status: NO_VALIDATE,
      });
  }

  return Account.findOne({ email })
    .then(result => {
      if (!result) {
        return response.status(200)
          .json({
            status: NOT_FOUND,
          });
      }

      const credentials = verifyPasswordHash(password, result.password, result.salt);

      if (credentials) {
        const { _id, username } = result;

        const payload = { identity: _id };

        const token = jwtSign(payload);

        return Account.findOneAndUpdate({ _id }, { $set: { lastAuth: new Date() } }, { new: true })
          .then(updateResult => response.status(200)
            .json({
              status: OK,
              result: {
                username, token, lastAuth: updateResult.lastAuth,
              },
            }));
      }

      return response.status(200)
        .json({
          status: NOT_FOUND,
        });
    });
};
