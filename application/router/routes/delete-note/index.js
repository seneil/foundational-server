const mongoose = require('mongoose');
const { OK, NOT_FOUND, NO_ACCESS } = require('../../constants/answer-codes');
const { MANAGER_PRIVILEGES } = require('../../constants');

const noteSchema = require('../../../schemas/note.schema');

const Note = mongoose.model('Note', noteSchema);

module.exports = (request, response) => {
  const { params: { name }, user: { privilege } } = request;

  if (!MANAGER_PRIVILEGES.includes(privilege)) {
    return response.status(200).json({ status: NO_ACCESS });
  }

  const action = Note.remove({ name });

  return action
    .then(result => {
      if (result.result.n) {
        return response.status(200).json({
          status: OK,
        });
      }

      return Promise.reject(NOT_FOUND);
    })
    .catch(error => {
      response.status(200).json({ status: error.errors || error });
    });
};
