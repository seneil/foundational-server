const mongoose = require('mongoose');

const accountSchema = require('../schemas/account-schema');
const sessionSchema = require('../schemas/session-schema');

const Account = mongoose.model('Account', accountSchema);
const Session = mongoose.model('Session', sessionSchema);

module.exports = (request, response) => {
  if (Object.keys(request.body).length) {
    Account.secureAccount(request.body, account => {
      const validate = account.validateSync();

      if (validate) {
        response.status(500).json({ error: true, message: validate.errors });
      } else {
        account.save(error => {
          if (error) {
            return response.status(500).json({ error: true, message: error.errors });
          }

          Session.findOneAndUpdate({ uid: account._id }, { $set: { active: false } }, { multi: true }, errorUpdated => {
            if (errorUpdated) {
              return response.status(500).json({ error: true });
            }

            const session = new Session({ uid: account._id });

            session.save(errorSave => {
              if (errorSave) {
                return response.status(500).json({ error: true });
              }

              return response.status(200).json({
                account: {
                  username: account.username,
                  sessionId: session.sessionId,
                },
              });
            });
          });
        });
      }
    });
  } else {
    response.status(500).json({ error: true });
  }
};
