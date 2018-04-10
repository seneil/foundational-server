const mongoose = require('mongoose');

const { jwtSign, generatePasswordHash } = require('../../passport-jwt/services');
const { OK, NO_VALIDATE } = require('../../constants/server-codes');

const accountSchema = require('../../../schemas/account.schema');

const Account = mongoose.model('Account', accountSchema);

module.exports = (request, response) => {
  const { username, email, password } = request.body;

  if (!(username && email && password)) {
    return response.status(200)
      .json({
        status: NO_VALIDATE,
      });
  }

  const { salt, hash } = generatePasswordHash(password);

  const account = new Account({ username, email, password: hash, salt });

  return account.save()
    .then(result => {
      const { _id } = result;

      const payload = { identity: _id };

      const token = jwtSign(payload);

      response.status(200)
        .json({
          status: OK,
          result: {
            username, token,
          },
        });
    })
    .catch(result => {
      const { errors } = result;

      response.status(200)
        .json({
          status: NO_VALIDATE,
          result: Object.values(errors)
            .map(error => error.message),
        });
    });
};
