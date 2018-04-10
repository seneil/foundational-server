const mongoose = require('mongoose');
const { OK, NOT_FOUND } = require('../../constants/server-codes');
const noteSchema = require('../../../schemas/note.schema');

const Note = mongoose.model('Note', noteSchema);

module.exports = (request, response) => {
  const { params: { name }, user: { _id: accountId } } = request;

  const action = Note.findOne({ name, account: accountId });

  action
    .then(result => {
      if (result) {
        return response.status(200).json({
          status: OK,
          result,
        });
      }

      return Promise.reject(NOT_FOUND);
    })
    .catch(error => {
      response.status(200).json({ status: error.errors || error });
    });
};

