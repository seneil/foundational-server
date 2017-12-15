const mongoose = require('mongoose');
const { OK } = require('../../constants/answer-codes');
const noteSchema = require('../../../schemas/note.schema');

const Note = mongoose.model('Note', noteSchema);

module.exports = (request, response) => {
  const { limit = 10, skip = 0 } = request.query;

  const action = Note.find().sort({ datetime: -1 }).skip(Number(skip)).limit(Number(limit));

  action
    .then(notes => response.status(200).json({
      status: OK,
      result: {
        notes,
        length: notes.length,
      },
    }))
    .catch(error => {
      response.status(500).json({ status: error.errors || error });
    });
};
