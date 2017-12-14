const Schema = require('mongoose').Schema;

const attachmentSchema = new Schema({
  url: {
    type: String,
    required: true,
  },
  hash: {
    type: String,
    index: true,
    required: true,
  },
});

module.exports = attachmentSchema;
