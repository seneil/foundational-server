const mongoose = require('mongoose');
const { OK, NOT_FOUND, NO_VALIDATE } = require('../../constants/answer-codes');

const scrapeUrl = require('../../../scripts/scrape-url');
const parseNote = require('../../../scripts/parse-note');
const updateNoteData = require('../../../scripts/update-note-data');
const scrapeImage = require('../../../scripts/scrape-image');

const noteSchema = require('../../../schemas/note.schema');
const attachmentSchema = require('../../../schemas/attachment.schema');

const Note = mongoose.model('Note', noteSchema);
const Attachment = mongoose.model('Attachment', attachmentSchema);

const scrapeUrls = (_id, iterator) => {
  const scrape = () => {
    const { value, done } = iterator.next();

    if (!done) {
      const [url] = value;

      Note
        .findOne({
          _id,
          attachments: {
            $elemMatch: {
              url: { $eq: url },
            },
          },
        })
        .then(note => Promise.all([note, scrapeUrl(url)]))
        .then(([note, scraped]) => {
          const { image } = scraped;
          const { datetime } = note;

          const criteria = { _id: note._id, 'attachments.url': url };
          const updateOne = attachment => Note
            .updateOne(criteria, {
              $set: {
                'attachments.$': new Attachment(attachment),
              },
            });

          if (image) {
            return scrapeImage({ uri: image, date: new Date(datetime) })
              .then(imageProps => updateOne({ url, ...scraped, imageProps }))
              .catch(() => updateOne({ url, ...scraped }));
          }

          return updateOne({ url, ...scraped });
        })
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
  const { params: { name }, body: { body }, user: { _id: accountId } } = request;

  if (!body) {
    return response.status(200)
      .json({ status: NO_VALIDATE });
  }

  return Note
    .findOne({ name, account: accountId })
    .then(result => {
      if (result) {
        const noteData = parseNote(body);
        const { _id } = result;
        const { keywords, emails, attachments } = updateNoteData(result, noteData);

        return Note
          .updateOne({ _id }, {
            $set: { body, keywords, emails, attachments, updated: new Date() },
          })
          .then(updated => {
            if (attachments.length) {
              const attachmentsIterator = attachments
                .filter(attachment => !attachment.title)
                .reduce((list, attachment) => list.add(attachment.url), new Set())
                .entries();

              scrapeUrls(_id, attachmentsIterator);
            }

            return response.status(200)
              .json({
                status: OK,
                result: {
                  modified: updated.nModified,
                },
              });
          });
      }

      return Promise.reject(NOT_FOUND);
    })
    .catch(error => {
      response.status(200)
        .json({ status: error.errors || error });
    });
};
