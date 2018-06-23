const controllers = require('requirefrom')('application/controllers');
const constants = require('requirefrom')('application/router/constants');

const {
  CODES: { OK, NO_VALIDATE, NO_ACCESS },
  PERMISSION: { WRITE_PRIVILEGES },
} = constants();

const postNote = controllers('post-note');

module.exports = async(request, response, next) => {
  const { body: { body }, user: { _id: accountId, privilege } } = request;

  if (!body) {
    return next({ status: NO_VALIDATE });
  }

  if (!WRITE_PRIVILEGES.includes(privilege)) {
    return next({ status: NO_ACCESS });
  }

  try {
    const result = await postNote(body, accountId);

    return response.status(200)
      .json({ status: OK, result });
  } catch ({ errors }) {
    return next({
      status: NO_VALIDATE,
      result: Object.values(errors)
        .map(error => error.message),
    });
  }
};
