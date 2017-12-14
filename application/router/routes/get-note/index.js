const mongoose = require('mongoose');

const ok = require('../../../constants/server-codes').ok;
const notFound = require('../../../constants/server-codes').notFound;

const noteSchema = require('../../../schemas/note-schema');
const openGraphSchema = require('../../../schemas/opengraph-schema');

const Note = mongoose.model('Note', noteSchema);
const OpenGraph = mongoose.model('OpenGraph', openGraphSchema);

module.exports = (request, response) => {
  const { name } = request.params;

  Note.findOne({ name })
    .then(note => {
      if (note) {
        return Promise.all([
          OpenGraph.find({ hash: { $in: note.attachments.map(attachment => attachment.hash) } }),
          note,
        ]);
      }

      return Promise.reject(notFound);
    })
    .then(([opengraphList, note]) => {
      const document = note.toObject();

      document.attachments.forEach(attachment => {
        attachment.opengraph = opengraphList.find(opengraph => opengraph.hash === attachment.hash);
      });

      response.json({
        status: ok,
        result: {
          note: document,
        },
      });
    })
    .catch(error => {
      response.json({ status: error.errors || error });
    });
};

