module.exports = bot => {
  bot.start(ctx => ctx.reply('Welcome!'));

  bot.on('text', ({ message }) => {
    return bot.telegram.sendMessage(message.chat.id, 'answer', {
      reply_to_message_id: message.message_id,
    });
  });

  return bot;
};
