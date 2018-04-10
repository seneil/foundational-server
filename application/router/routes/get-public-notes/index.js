const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');

const { OK } = require('../../constants/server-codes');
const noteSchema = require('../../../schemas/note.schema');

noteSchema.plugin(mongoosePaginate);

const Note = mongoose.model('Note', noteSchema);

module.exports = (request, response) => {
  const { query } = request;

  const limit = Number(query.limit) || 10;
  const offset = Number(query.offset) || 0;

  Note.paginate({ public: true }, { sort: { datetime: -1 }, limit, offset })
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
