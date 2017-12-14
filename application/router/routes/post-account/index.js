const mongoose = require('mongoose');

const ok = require('../../../constants/server-codes').ok;
const noValidate = require('../../../constants/server-codes').noValidate;

const accountSchema = require('../../../schemas/account-schema');
const sessionSchema = require('../../../schemas/session-schema');

const Account = mongoose.model('Account', accountSchema);
const Session = mongoose.model('Session', sessionSchema);

module.exports = (request, response) => {
  Account.secureAccount(request.body)
    .then(account => {
      const validate = account.validateSync();

      if (validate) return Promise.reject(noValidate);

      return account.save();
    })
    .then(account => Promise.all([
      account,
      Session.findOneAndUpdate({ uid: account._id }, { $set: { active: false } }, { multi: true }),
    ]))
    .then(([account]) => {
      const session = new Session({ uid: account._id });

      return Promise.all([
        account,
        session.save(),
      ]);
    })
    .then(([account, session]) => {
      response.status(200).json({
        status: ok,
        result: {
          account: {
            username: account.username,
            sessionId: session.sessionId,
          },
        },
      });
    })
    .catch(error => {
      response.json({ status: error.errors || error });
    });
};
