const mongoose = require('mongoose');
const shortID = require('mongodb-short-id');

const scrapeUrl = require('../scripts/scrape-url');

const noteSchema = require('../schemas/note-schema');
const openGraphSchema = require('../schemas/opengraph-schema');

const Note = mongoose.model('Note', noteSchema);
const OpenGraph = mongoose.model('OpenGraph', openGraphSchema);

module.exports = (request, response) => {
  if (Object.keys(request.body).length) {
    const { body } = request.body;
    const note = Note.parseNote({ body });

    note.name = shortID.objectIDtoShort(note._id);

    const validate = note.validateSync();

    if (validate) {
      response.status(500).json({ error: true, message: validate.errors });
    } else {
      note.save(error => {
        if (error) throw error;

        if (note.attachments.length) {
          note.attachments.forEach(attachment => {
            const { url, hash } = attachment;

            scrapeUrl(url).then(metadata => {
              const openGraphModel = new OpenGraph(Object.assign(metadata, { hash }));

              OpenGraph.find({ hash }, (findError, document) => {
                if (!document.length) {
                  openGraphModel.save(saveError => {
                    if (saveError) throw saveError;
                  });
                }
              });
            }).catch(scrapeError => {
              throw scrapeError;
            });
          });
        }

        response.status(200).json({ note });
      });
    }
  } else {
    response.status(500).json({ error: true });
  }
};
