const Schema = require('mongoose').Schema;

const emailSchema = new Schema({
  email: {
    type: String,
    index: true,
  },
});

module.exports = emailSchema;
