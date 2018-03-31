const config = require('config');
const Telegraf = require('telegraf');

const { token, webHookDomain } = config.get('telegram');

const logger = require('./../../../application/common/logger');
const routes = require('./routes');

const telegraf = new Telegraf(token);

telegraf.catch(error => {
  logger.error(error);
});

const telegrafStart = async({ initialize }) => {
  const botInfo = await telegraf.telegram.getMe();

  logger.info('Telegram bot info: %o', botInfo);

  return initialize(telegraf);
};

telegraf.context.webHookDomain = webHookDomain;
telegraf.context.apiWebhookPath = `/v1/receive/${token}`;

routes(telegraf);

module.exports = {
  telegraf,
  telegrafStart,
};
