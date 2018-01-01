const Schema = require('mongoose').Schema;
const nanoId = require('nanoid');

const sessionSchema = new Schema({
  uid: {
    type: Schema.Types.ObjectId,
    index: true,
    required: true,
  },
  sessionId: {
    type: String,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  active: {
    type: Boolean,
    default: true,
  },
});

sessionSchema.pre('save', function(next) {
  const session = this;

  session.sessionId = nanoId();
  next();
});

module.exports = sessionSchema;
