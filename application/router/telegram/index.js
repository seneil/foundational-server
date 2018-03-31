const config = require('config');
const ngrok = require('ngrok');

const logger = require('./../../../application/common/logger');

const { ENV: { STAGING, DEPLOYMENT } } = require('../constants');

const { env, port } = config.get('application');
const { token: authtoken } = config.get('ngrok');

const { telegraf, telegrafStart } = require('./bot');

const initialize = async bot => {
  const { webHookDomain, apiWebhookPath } = bot.context;

  await bot.telegram.deleteWebhook();

  if (env === STAGING) {
    const url = await ngrok.connect({
      authtoken,
      addr: port,
    });

    logger.info('ngrok address: %s', url);
    bot.telegram.setWebhook(`${url}/api${apiWebhookPath}`);

    return bot;
  }

  if (env === DEPLOYMENT) {
    bot.telegram.setWebhook(`${webHookDomain}/api${apiWebhookPath}`);

    return bot;
  }

  return Promise.reject(false);
};

telegrafStart({ initialize })
  .then(async bot => {
    logger.info('getWebhookInfo: %o', await bot.telegram.getWebhookInfo());
  });

module.exports = telegraf;
