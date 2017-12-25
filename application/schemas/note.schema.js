const mongoose = require('mongoose');
const generate = require('nanoid/generate');
const uniqueValidator = require('mongoose-unique-validator');

const Schema = mongoose.Schema;

const attachmentSchema = require('./attachment.schema');
const emailSchema = require('./email.schema');
const tagSchema = require('./tag.schema');

const Tag = mongoose.model('Tag', tagSchema);
const Email = mongoose.model('Email', emailSchema);
const Attachment = mongoose.model('Attachment', attachmentSchema);

const noteSchema = new Schema({
  name: {
    type: String,
    index: true,
    unique: true,
    required: true,
  },
  body: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['article'],
    default: 'article',
  },
  keywords: [tagSchema],
  emails: [emailSchema],
  attachments: [attachmentSchema],
  account: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  public: {
    type: Boolean,
    default: false,
  },
  datetime: {
    type: Date,
    default: Date.now,
  },
});

noteSchema.plugin(uniqueValidator);

noteSchema.statics.createNote = function(body, data) {
  const { emails, urls, keywords } = data;

  return new this({
    name: generate('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ$@', 10),
    body,
    account: '5a270a496d87db18200d0c2a',
    keywords: keywords.map(keyword => new Tag({ title: keyword })),
    emails: emails.map(email => new Email({ email })),
    attachments: urls.map(url => new Attachment({ url: url.replace(/\/$/, '') })),
  });
};

module.exports = noteSchema;
