const { OK } = require('../../constants/server-codes');

module.exports = (request, response) => {
  const { user: { username, email, privilege } } = request;

  return response.status(200)
    .json({
      status: OK,
      result: { username, email, privilege },
    });
};
