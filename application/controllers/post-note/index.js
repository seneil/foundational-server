const mongoose = require('mongoose');

const { NOT_FOUND } = require('../../router/constants/answer-codes');

const parseNote = require('../../scripts/parse-note');
const scrapeUrl = require('../../scripts/scrape-url');
const scrapeImage = require('../../scripts/scrape-image');

const noteSchema = require('../../schemas/note.schema');
const attachmentSchema = require('../../schemas/attachment.schema');

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

module.exports = (body, accountId) => {
  const noteData = parseNote(body);
  const note = Note.createNote(accountId, body, noteData);
  const invalid = note.validateSync();

  if (invalid) {
    return Promise.reject(invalid);
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

      return result;
    });
};
