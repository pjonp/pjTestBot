const reqEvent = (event) => require(`../events/${event}`)
module.exports = TWITCHBOT => {
  TWITCHBOT.on('connected', () => reqEvent('TwitchConnected')(TWITCHBOT));
  TWITCHBOT.on('message', (room, user, message, self) => reqEvent('TwitchMessage')(TWITCHBOT, room, user, message, self));
  
//  TWITCHBOT.on('subscription', (room, username, method, message, user) => reqEvent('Tsub')(room, username, method, message, user));
//  TWITCHBOT.on('resub', (room, username, months, message, user, method) => reqEvent('Tresub')(room, username, months, message, user, method));
//  TWITCHBOT.on('subgift', (room, username, recipient, method, user) => reqEvent('Tsubgift')(room, username, recipient, method, user));
};
