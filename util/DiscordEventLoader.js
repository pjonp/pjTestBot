const reqEvent = (event) => require(`../events/${event}`)
module.exports = DISCORDBOT => {
  DISCORDBOT.on('ready', () => reqEvent('DiscordReady')(DISCORDBOT));
//  DISCORDBOT.on('reconnecting', () => reqEvent('reconnecting')(Dbot));
//  DISCORDBOT.on('disconnect', () => reqEvent('disconnect')(Dbot));
  DISCORDBOT.on('message', (message) => reqEvent('DiscordMessage')(DISCORDBOT, message));
};
