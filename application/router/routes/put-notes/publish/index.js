const mongoose = require('mongoose');
const noteSchema = require('../../../../schemas/note.schema');

const Note = mongoose.model('Note', noteSchema);

module.exports = state => (accountId, names = []) =>
  Note.updateMany(
    {
      account: accountId,
      name: {
        $in: names,
      },
    }, {
      $set: state,
    },
  );
