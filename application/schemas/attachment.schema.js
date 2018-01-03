const Schema = require('mongoose').Schema;

const attachmentSchema = new Schema({
  url: {
    type: String,
    index: true,
  },
  title: String,
  ogTitle: String,
  description: String,
  ogDescription: String,
  ogLocale: String,
  charset: String,
  type: String,
  image: String,
  datetime: {
    type: Date,
    default: Date.now,
  },
});

module.exports = attachmentSchema;
