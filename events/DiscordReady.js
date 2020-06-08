
module.exports = DISCORDBOT => {
  console.log('+++PJ TEST BOT CONNECTED TO DISCORD');
  DISCORDBOT.user.setPresence({ activity: { name: `${process.env.D_BOTACTIVITY}`, type: 'WATCHING' }, status: `${process.env.D_BOTSTATUS}` })
  .catch(console.error);
}
