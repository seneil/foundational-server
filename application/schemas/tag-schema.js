const Schema = require('mongoose').Schema;

const tagSchema = new Schema({
  title: {
    type: String,
    index: true,
    required: true,
  },
});

module.exports = tagSchema;
