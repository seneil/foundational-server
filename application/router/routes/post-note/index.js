const mongoose = require('mongoose');
const { OK, ERROR, NOT_FOUND, NO_VALIDATE, NO_ACCESS } = require('../../constants/answer-codes');
const { WRITE_PRIVILEGES } = require('../../constants');

const parseNote = require('../../../scripts/parse-note');
const scrapeUrl = require('../../../scripts/scrape-url');

const noteSchema = require('../../../schemas/note.schema');
const attachmentSchema = require('../../../schemas/attachment.schema');

const Note = mongoose.model('Note', noteSchema);
const Attachment = mongoose.model('Attachment', attachmentSchema);

const scrapeUrls = iterator => {
  const scrape = () => {
    const { value, done } = iterator.next();

    if (!done) {
      const [url] = value;

      Note
        .findOne({
          attachments: {
            $elemMatch: {
              url: { $eq: url },
              title: { $exists: false },
            },
          },
        })
        .then(note => {
          if (note) {
            return Promise.all([note, scrapeUrl(url)]);
          }

          return Promise.reject({
            status: NOT_FOUND,
            result: { url },
          });
        })
        .then(([note, scraped]) => Note
          .updateOne({
            _id: note._id, 'attachments.url': url,
          }, {
            $set: {
              'attachments.$': new Attachment({ url, ...scraped }),
            },
          }))
        .then(result => {
          console.log(`Update attachment: ${url}`, { result });
          scrape();
        })
        .catch(error => {
          console.log({ error });
          scrape();
        });
    }
  };

  scrape();
};

module.exports = (request, response) => {
  const { body: { body }, user: { privilege } } = request;

  if (!body) {
    return response.status(200).json({ status: NO_VALIDATE });
  }

  if (!WRITE_PRIVILEGES.includes(privilege)) {
    return response.status(200).json({ status: NO_ACCESS });
  }

  const noteData = parseNote(body);
  const note = Note.createNote(body, noteData);
  const invalid = note.validateSync();

  if (invalid) {
    const { errors } = invalid;

    return response.status(200).json({
      status: NO_VALIDATE,
      result: Object.values(errors).map(error => error.message),
    });
  }

  return note
    .save()
    .then(result => {
      if (note.attachments.length) {
        const attachmentsIterator = note.attachments
          .reduce((list, attachment) => list.add(attachment.url), new Set())
          .entries();

        scrapeUrls(attachmentsIterator);
      }

      response.status(200).json({
        status: OK,
        result,
      });
    })
    .catch(error => response.status(200).json({
      status: ERROR,
      result: error,
    }));
};
