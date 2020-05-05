const setup = require('../.hidden/settings.json');
module.exports = DISCORDBOT => {
  console.log('+++PJ TEST BOT CONNECTED TO DISCORD');
  DISCORDBOT.user.setPresence({ activity: { name: `${setup.D_BOTACTIVITY}`, type: 'WATCHING' }, status: `${setup.D_BOTSTATUS}` })
  .catch(console.error);
}
