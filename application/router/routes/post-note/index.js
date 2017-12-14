const mongoose = require('mongoose');
const shortID = require('mongodb-short-id');

const ok = require('../../../constants/server-codes').ok;

const scrapeUrl = require('../../../scripts/scrape-url');

const noteSchema = require('../../../schemas/note-schema');
const openGraphSchema = require('../../../schemas/opengraph-schema');

const Note = mongoose.model('Note', noteSchema);
const OpenGraph = mongoose.model('OpenGraph', openGraphSchema);

module.exports = (request, response) => {
  const { body } = request.body;

  if (!body || !body.length) {
    return response.status(500).json({ error: true });
  }

  const note = Note.parseNote({ body });

  note.name = shortID.objectIDtoShort(note._id);

  return note.save()
    .then(noteData => Promise.all([
      noteData,
      noteData.attachments.map(attachment => {
        const { url, hash } = attachment;

        return Promise.all([hash, scrapeUrl(url)]);
      }),
    ]))
    .then(([noteData, attachmentsPromises]) => Promise.all([noteData, Promise.all(attachmentsPromises)]))
    .then(([noteData, attachments]) => Promise.all([noteData, attachments, OpenGraph.find({
      hash: {
        $in: attachments.map(attachment => {
          const [hash] = attachment;

          return hash;
        }),
      },
    })]))
    .then(([noteData, attachments, documents]) => Promise.all([noteData, attachments.filter(attachment => {
      const [hash] = attachment;

      return !documents.map(document => document.hash).includes(hash);
    }).map(attachment => {
      const [hash, metadata] = attachment;
      const openGraphModel = new OpenGraph(Object.assign(metadata, { hash }));

      return openGraphModel.save();
    })]))
    .then(([noteData]) => {
      response.status(200).json({
        status: ok,
        result: {
          note: noteData,
        },
      });
    })
    .catch(error => {
      response.status(500).json({ status: error.errors || error });
    });
};
