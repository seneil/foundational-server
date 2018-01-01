const mongoose = require('mongoose');
const { OK, NOT_FOUND } = require('../../constants/answer-codes');
const noteSchema = require('../../../schemas/note.schema');

const Note = mongoose.model('Note', noteSchema);

module.exports = (request, response) => {
  const { name } = request.params;

  const action = Note.remove({ name });

  action
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
