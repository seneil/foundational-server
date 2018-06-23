const Schema = require('mongoose').Schema;
const imagePropsSchema = require('./image-props.schema');

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
  imageProps: imagePropsSchema,
  datetime: {
    type: Date,
    default: Date.now,
  },
});

module.exports = attachmentSchema;
