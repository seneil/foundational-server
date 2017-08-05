const mongoose = require('mongoose');
const shortID = require('mongodb-short-id');

const noteSchema = require('../schemas/note-schema');
const openGraphSchema = require('../schemas/opengraph-schema');

const Note = mongoose.model('Note', noteSchema);
const OpenGraph = mongoose.model('OpenGraph', openGraphSchema);

module.exports = (request, response) => {
  const { name } = request.params;

  try {
    const id = shortID.shortToObjectID(name);

    Note.findById(id, (errorNote, note) => {
      OpenGraph
        .find({ hash: { $in: note.attachments.map(attachment => attachment.hash) } })
        .exec((errorOpengraph, opengraphList) => {
          const document = note.toObject();

          if (errorOpengraph) throw errorOpengraph;

          document.attachments.forEach(attachment => {
            attachment.opengraph = opengraphList.find(opengraph => opengraph.hash === attachment.hash);
          });

          response.json({ note: document });
        });
    });
  } catch (error) {
    response.json({ error: true });
  }
};

