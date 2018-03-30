const config = require('config');
const ngrok = require('ngrok');
const Telegraf = require('telegraf');

const logger = require('./../../../application/common/logger');

const { token } = config.get('telegram');
const { port } = config.get('application');
const { token: authtoken } = config.get('ngrok');

const bot = new Telegraf(token);

const connect = () => ngrok.connect({
  authtoken,
  addr: port,
});

connect()
  .then(async url => {
    logger.info('ngrok address: %s', url);
    bot.telegram.setWebhook(`${url}/api/v1/receive/${token}`);
    bot.startWebhook(`${url}/api/v1/receive/${token}`);

    logger.info('%o', await bot.telegram.getWebhookInfo());
  });

module.exports = (request, response) => {
  const { body } = request;

  console.log(body);

  response.sendStatus(200);
};
