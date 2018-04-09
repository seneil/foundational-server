const mongoose = require('mongoose');

const accountSchema = require('../../../../schemas/account.schema');

const Account = mongoose.model('Account', accountSchema);

module.exports = accountId =>
  Account.findOne({ 'telegram.id': accountId });
