module.exports = telegraf => {
  telegraf.start(ctx => ctx.reply('Welcome!'));

  return telegraf;
};
