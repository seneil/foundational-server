const Schema = require('mongoose').Schema;
const uniqueValidator = require('mongoose-unique-validator');

const emailValidator = email => {
  const emailRegex = /^([\w-.]+@([\w-]+.)+[\w-]{2,4})?$/;

  return emailRegex.test(email);
};

const lengthValidator = value => value.length && value.length <= 128;

const accountSchema = new Schema({
  username: {
    type: String,
    unique: true,
    required: true,
    validate: lengthValidator,
  },
  email: {
    type: String,
    unique: true,
    required: true,
    validate: [
      { validator: lengthValidator },
      { validator: emailValidator },
    ],
  },
  password: {
    type: String,
    required: true,
  },
  salt: {
    type: String,
    required: true,
  },
  privilege: {
    type: String,
    enum: ['reader', 'writer', 'manager', 'owner'],
    default: 'manager',
  },
  registered: {
    type: Date,
    default: Date.now,
  },
  lastAuth: {
    type: Date,
    default: Date.now,
  },
});

accountSchema.plugin(uniqueValidator);

module.exports = accountSchema;
