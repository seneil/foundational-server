const Schema = require('mongoose').Schema;

const openGraphSchema = new Schema({
  title: String,
  description: String,
  html: String,
  image: String,
  type: String,
  hash: {
    type: String,
    required: true,
    unique: true,
  },
  datetime: {
    type: Date,
    default: Date.now,
  },
});

module.exports = openGraphSchema;
