const Discord = require('discord.js'),
  Twitch = require('tmi.js'),
  SETTINGS = require('./.hidden/settings.json'),
  DISCORDBOT = new Discord.Client(),
  D_OWNERNAME = SETTINGS.D_OWNERNAME, //lowercase
  D_OWNERID = SETTINGS.D_OWNERID

//START DISCORD
DISCORDBOT.login(SETTINGS.D_TOKEN).catch(err => {
    console.log('****Discord Connection Error:', err);
});
//START TWITCH
const TWITCHBOT = new Twitch.client(
  {
  options: { debug: false }, //see info/chat in console. true to enable.
  connection: { reconnect: true },
  identity: {
    username: SETTINGS.T_BOTUSERNAME,
    password: SETTINGS.T_OAUTHTOKEN
  },
  channels: SETTINGS.T_CHANNELNAME
});
TWITCHBOT.connect().catch((err) => {
    console.log('****Twitch Connection Error:', err);
});

require('./util/DiscordEventLoader')(DISCORDBOT);
require('./util/TwitchEventLoader')(TWITCHBOT);
