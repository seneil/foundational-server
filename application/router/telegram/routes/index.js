const signup = require('../signup');
const postText = require('./postText');
const getNote = require('./getNote');

module.exports = bot => {
  const reply = (message, response) =>
    bot.telegram.sendMessage(message.chat.id, response, {
      reply_to_message_id: message.message_id,
    });

  bot.start(ctx => {
    const { message: { from, date } } = ctx;

    signup({ from, date })
      .then(result => ctx.reply(result));
  });

  bot.command('/hey', ctx => ctx.reply('I`m alive! 🖖'));

  bot.command('/note', async ctx => {
    const { message } = ctx;

    return reply(message, await getNote(message));
  });

  bot.on('text', async ctx => {
    const { message } = ctx;

    return reply(message, await postText(message));
  });

  bot.on('photo', ({ message }) => {
    console.log('on photo');
    console.log(message);
  });

  return bot;
};
