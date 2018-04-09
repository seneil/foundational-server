const { OK, NO_VALIDATE, NO_ACCESS } = require('../../constants/answer-codes');
const { WRITE_PRIVILEGES } = require('../../constants');

const postNote = require('../../../controllers/post-note');

module.exports = (request, response) => {
  const { body: { body }, user: { _id: accountId, privilege } } = request;

  if (!body) {
    return response.status(200)
      .json({ status: NO_VALIDATE });
  }

  if (!WRITE_PRIVILEGES.includes(privilege)) {
    return response.status(200)
      .json({ status: NO_ACCESS });
  }

  return postNote(body, accountId)
    .then(result => response.status(200)
      .json({
        status: OK,
        result,
      }))
    .catch(invalid => {
      const { errors } = invalid;

      return response.status(200)
        .json({
          status: NO_VALIDATE,
          result: Object.values(errors)
            .map(error => error.message),
        });
    });
};
