const crypto = require('crypto');
const Schema = require('mongoose').Schema;
const uniqueValidator = require('mongoose-unique-validator');

const tagSchema = require('./tag-schema');
const emailSchema = require('./email-schema');
const attachmentSchema = require('./attachment-schema');

const parseNote = require('../scripts/parse-note');

const noteSchema = new Schema({
  body: {
    type: String,
    required: true,
  },
  html: String,
  public: {
    type: Boolean,
    default: false,
  },
  datetime: {
    type: Date,
    default: Date.now,
  },
  name: {
    type: String,
    index: true,
    unique: true,
    required: true,
  },
  hashtags: [tagSchema],
  emails: [emailSchema],
  attachments: [attachmentSchema],
});

noteSchema.plugin(uniqueValidator);

noteSchema.statics.parseNote = function(data) {
  const { html, emails, urls, hashtags } = parseNote(data.body);

  return new this(Object.assign(data, {
    html,
    hashtags: hashtags.map(hashtag => ({ title: hashtag })),
    emails: emails.map(email => ({ email })),
    attachments: urls.map(url => {
      const hash = crypto.createHash('md5');

      return {
        url,
        hash: hash.update(url).digest('hex'),
      };
    }),
  }));
};

module.exports = noteSchema;
