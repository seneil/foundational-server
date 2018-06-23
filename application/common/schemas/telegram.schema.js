const Schema = require('mongoose').Schema;

const telegramSchema = new Schema({
  id: {
    type: Number,
  },
  firstName: {
    type: String,
  },
  lastName: {
    type: String,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = telegramSchema;
