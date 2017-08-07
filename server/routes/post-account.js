const mongoose = require('mongoose');

const accountSchema = require('../schemas/account-schema');

const Account = mongoose.model('Account', accountSchema);

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

          return response.status(200).json({ account });
        });
      }
    });
  } else {
    response.status(500).json({ error: true });
  }
};
