const mongoose = require('mongoose');
const application = require('requirefrom')('application');
const constants = require('requirefrom')('application/router/constants');

const { parseNote, scrapeUrl, scrapeImage } = application('scripts');
const { noteSchema, attachmentSchema } = application('schemas');
const { CODES: { NOT_FOUND } } = constants();

const Note = mongoose.model('Note', noteSchema);
const Attachment = mongoose.model('Attachment', attachmentSchema);

const scrapeUrls = iterator => {
  const scrape = async() => {
    const { value, done } = iterator.next();

    if (done) return;

    const [url] = value;

    try {
      const note = await Note.findOne({
        attachments: {
          $elemMatch: {
            url: { $eq: url },
            title: { $exists: false },
          },
        },
      });

      if (!note) {
        Promise.reject({ status: NOT_FOUND, result: { url } });
        return;
      }

      const scraped = await scrapeUrl(url);

      const updateOne = attachment => Note
        .updateOne({
          _id: note._id,
          'attachments.url': url,
        }, {
          $set: {
            'attachments.$': new Attachment(attachment),
          },
        });

      const { image } = scraped;

      let result;

      if (image) {
        try {
          const imageProps = await scrapeImage({ uri: image, date: new Date(note.datetime) });

          result = await updateOne({ url, ...scraped, imageProps });
          return;
        } catch (error) {
          result = await updateOne({ url, ...scraped });
          return;
        }
      }

      result = await updateOne({ url, ...scraped });

      console.log(`Update attachment: ${url}`, { result });

      scrape();
    } catch (error) {
      console.log({ error });
      scrape();
    }
  };

  scrape();
};

module.exports = async(body, accountId) => {
  const noteData = parseNote(body);
  const note = Note.createNote(accountId, body, noteData);

  const invalid = note.validateSync();

  if (invalid) return Promise.reject(invalid);

  const result = await note.save();

  if (note.attachments.length) {
    const attachmentsIterator = note.attachments
      .reduce((list, attachment) => list.add(attachment.url), new Set())
      .entries();

    scrapeUrls(attachmentsIterator);
  }

  return result;
};
