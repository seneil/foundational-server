const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');

const { OK } = require('../../constants/answer-codes');
const noteSchema = require('../../../schemas/note.schema');

noteSchema.plugin(mongoosePaginate);

const Note = mongoose.model('Note', noteSchema);

module.exports = (request, response) => {
  const { limit = 10, offset = 0 } = request.query;

  Note.paginate({}, { datetime: -1, limit: Number(limit), offset: Number(offset) })
    .then(result => {
      const { docs, total } = result;

      return response.status(200).json({
        status: OK,
        result: { notes: docs, total, limit, offset },
      });
    })
    .catch(error => {
      response.status(200).json({ status: error.errors || error });
    });
};
