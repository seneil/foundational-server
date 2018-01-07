const { OK, NO_VALIDATE } = require('../../constants/answer-codes');
const { PUBLISH, UNPUBLISH } = require('../../constants/actions');

const publish = require('./publish');

module.exports = (request, response) => {
  const { body: { action, names }, user: { _id: accountId } } = request;

  switch (action) {
    case PUBLISH:
    case UNPUBLISH:
      return publish({ public: action === PUBLISH })(accountId, names)
        .then(result => response.status(200)
          .json({
            status: OK,
            result: {
              modified: result.nModified,
            },
          }))
        .catch(error => response.status(200)
          .json({
            status: error,
          }));

    default:
      return response.status(200)
        .json({
          status: NO_VALIDATE,
        });
  }
};
