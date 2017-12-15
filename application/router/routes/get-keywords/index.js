const mongoose = require('mongoose');
const { OK } = require('../../constants/answer-codes');
const noteSchema = require('../../../schemas/note.schema');

const Note = mongoose.model('Note', noteSchema);

module.exports = (request, response) => {
  const action = Note.distinct('keywords.title');

  action
    .then(keywords => response.status(200).json({
      status: OK,
      result: {
        keywords,
        length: keywords.length,
      },
    }))
    .catch(error => {
      response.status(500).json({ status: error.errors || error });
    });
};
