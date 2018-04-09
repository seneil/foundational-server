const mongoose = require('mongoose');
const getAccount = require('../../controllers/get-account');

const noteSchema = require('../../../../schemas/note.schema');

const Note = mongoose.model('Note', noteSchema);

module.exports = async message => {
  const { from, text } = message;

  const account = await getAccount(from.id);

  if (account) {
    const { _id: accountId } = account;
    const name = text.split(' ')[1];

    console.log('Get note', name);

    const note = await Note.findOne({ name, account: accountId });

    if (note) {
      return note.body;
    }

    return 'Nothing 🤷🏻‍♂️!';
  }

  return Promise.resolve('Use `/start` private command!');
};
