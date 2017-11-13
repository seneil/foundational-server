const Schema = require('mongoose').Schema;
const uniqueValidator = require('mongoose-unique-validator');
const sha256 = require('crypto-js/sha256');

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

  return new Promise(resolve => {
    resolve(new this(Object.assign({
      username,
      email,
    }, {
      password: sha256(password).toString(),
    })));
  });
};

module.exports = accountSchema;
