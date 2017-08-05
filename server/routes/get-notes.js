const mongoose = require('mongoose');

const noteSchema = require('../schemas/note-schema');
const openGraphSchema = require('../schemas/opengraph-schema');

const Note = mongoose.model('Note', noteSchema);
const OpenGraph = mongoose.model('OpenGraph', openGraphSchema);

module.exports = (request, response) => {
  const { limit = 5, skip = 0 } = request.query;

  Note.find({})
    .sort({ datetime: 'descending' })
    .skip(Number(skip))
    .limit(Number(limit))
    .exec((errorNotes, notes) => {
      const attachmentsHashList = notes
        .reduce((list, note) => list.concat(note.attachments.map(attachment => attachment.hash)), [])
        .reduce((list, note) => {
          if (!list.includes(note)) {
            list.push(note);
          }

          return list;
        }, []);

      OpenGraph
        .find({ hash: { $in: attachmentsHashList } })
        .exec((errorOpengraph, opengraphList) => {
          const documents = notes.map(note => note.toObject());

          documents.forEach(note => {
            note.attachments.forEach(attachment => {
              attachment.opengraph = opengraphList.find(opengraph => opengraph.hash === attachment.hash);
            });
          });

          response.json({ notes: documents, count: documents.length });
        });
    });
};
