const postNote = require('../../../../controllers/post-note');
const getAccount = require('../../controllers/get-account');

module.exports = async message => {
  const { from, text } = message;

  const account = await getAccount(from.id);

  if (account) {
    const { _id: accountId } = account;

    try {
      const note = await postNote(text, accountId);

      return `/note ${note.name}`;
    } catch (error) {
      return `Something went wrong: ${error} 😱`;
    }
  }

  return Promise.resolve('Use `/start` private command!');
};
