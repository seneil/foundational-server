const config = require('config');

const { ENV: { STAGING, DEVELOPMENT } } = require('../constants');

const { env } = config.get('application');

const router = () => {
  switch (env) {
    case STAGING:
    case DEVELOPMENT:
      return require('./ngrok');
    default:
      return require('./web-hook');
  }
};

module.exports = router();
