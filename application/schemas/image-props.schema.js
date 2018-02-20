const Schema = require('mongoose').Schema;

const imagePropsSchema = new Schema({
  path: String,
  name: String,
  ext: String,
});

module.exports = imagePropsSchema;
