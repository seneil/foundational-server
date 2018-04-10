const mongoose = require('mongoose');

const logger = require('./../../../../application/common/logger');

const { generatePasswordHash } = require('../../passport-jwt/services');
const { NO_VALIDATE } = require('../../constants/server-codes');

const accountSchema = require('../../../schemas/account.schema');

const Account = mongoose.model('Account', accountSchema);

module.exports = ({ from, date }) => {
  const { id, first_name: firstName, last_name: lastName, username } = from;
  const password = `no-password-needed-${id}`;
  const email = `no-email-needed-${id}@example.com`;
  const jsDate = new Date(date * 1000);

  if (!id) return NO_VALIDATE;

  const { salt, hash } = generatePasswordHash(password);

  const account = new Account({
    username, email, password: hash, salt, telegram: { id, firstName, lastName, date: jsDate },
  });

  return Account
    .findOne({ 'telegram.id': id })
    .then(result => {
      if (result) return `Welcome back ${account.telegram.firstName} ${account.telegram.lastName}!`;

      return account.save()
        .then(() => `Welcome ${firstName} ${lastName}!`)
        .catch(error => {
          logger.error('Account create error: %o', error);
          return NO_VALIDATE;
        });
    });
};
