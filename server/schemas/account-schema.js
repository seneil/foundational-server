const Schema = require('mongoose').Schema;
const uniqueValidator = require('mongoose-unique-validator');
const bcrypt = require('bcrypt');

const accountSchema = new Schema({
  username: {
    type: String,
    index: true,
    unique: true,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
});

accountSchema.plugin(uniqueValidator);

accountSchema.statics.secureAccount = function(account) {
  const { username, email, password } = account;

  return new Promise((resolve, reject) => {
    bcrypt.hash(password, 10, (error, hash) => {
      if (error) reject(error);

      resolve(new this(Object.assign({
        username,
        email,
      }, {
        password: hash,
      })));
    });
  });
};

module.exports = accountSchema;
