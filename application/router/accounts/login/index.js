const constants = require('requirefrom')('application/common/constants');
const controllers = require('requirefrom')('application/controllers');

const { CODES: { OK, NO_VALIDATE } } = constants();

const postLogin = controllers('post-login');

module.exports = async(request, response, next) => {
  const { email, password } = request.body;

  if (!(email && password)) {
    return next({ error: NO_VALIDATE });
  }

  try {
    const result = await postLogin(email, password);

    return response.status(200)
      .json({ status: OK, result });
  } catch (error) {
    return next({ error });
  }
};
