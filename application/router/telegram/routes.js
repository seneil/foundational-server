const signup = require('./signup');

module.exports = bot => {
  bot.start(ctx => {
    const { from, date } = ctx.message;

    signup({ from, date })
      .then(result => ctx.reply(result));
  });

  return bot;
};
