// BOT OAUTH LINK https://id.twitch.tv/oauth2/authorize?response_type=token&client_id=   CLIENTID   &redirect_uri=https://twitchapps.com/tmi/&scope=chat:read+chat:edit+whispers:read+whispers:edit+clips:edit+channel:moderate
// YOUR OAUTH LINK BOT OAUTH LINK https://id.twitch.tv/oauth2/authorize?response_type=token&client_id=   CLIENTID   &redirect_uri=https://twitchapps.com/tmi/&scope=clips:edit+channel:read:redemptions
const Discord = require('discord.js'),
  Twitch = require('tmi.js'),
  TwitchPS = require('twitchps'),
  SETTINGS = require('./.hidden/settings.json'),
  DISCORDBOT = new Discord.Client(),
  D_OWNERNAME = SETTINGS.D_OWNERNAME, //lowercase
  D_OWNERID = SETTINGS.D_OWNERID,
  io = require("socket.io"),
  SE_OVERLAYS = io.listen('7654');

//START DISCORD
DISCORDBOT.login(SETTINGS.D_TOKEN).catch(err => {
  console.log('****Discord Connection Error:', err);
});

//START TWITCH
const TWITCHBOT = new Twitch.client({
  options: {
    debug: false
  }, //see info/chat in console. true to enable.
  connection: {
    reconnect: true
  },
  identity: {
    username: SETTINGS.T_BOTUSERNAME,
    password: `oauth:${SETTINGS.T_BOTOAUTHTOKEN}`
  },
  channels: [SETTINGS.T_CHANNELNAME]
});

TWITCHBOT.connect().catch((err) => {
  console.log('****Twitch Connection Error:', err);
});

//Twitch PubSub
//Initial topics are required
const init_topics = [{
    topic: `video-playback.${SETTINGS.T_CHANNELNAME}`
  }, {
    topic: `channel-points-channel-v1.${SETTINGS.T_CHANNELID}`,
    token: SETTINGS.T_OAUTHTOKEN
  } /*, {topic: `whispers.${SETTINGS.T_BOTCHANNELID}`, token: SETTINGS.T_BOTOAUTHTOKEN} */ ],
  TWITCHPUBSUB = new TwitchPS({
    init_topics: init_topics,
    reconnect: true,
    debug: false
  });

//Stream Elements overlays
SE_OVERLAYS.on('connection', socket => {
  console.log('connection made...');
  socket.on('overlayLoaded', overlay => {
    console.log(`***Overlay Loaded: ${overlay}`);
  });
  socket.on('saveSEPoints', (username) => {
    console.log(`***saving points for: ${username}`);
  });
});

require('./util/DiscordEventLoader')(DISCORDBOT);
require('./util/TwitchEventLoader')(TWITCHBOT);
require('./util/TwitchPubSubEventLoader')(TWITCHPUBSUB, TWITCHBOT, SETTINGS.T_CHANNELNAME);

module.exports = {
  SE_OVERLAYS: SE_OVERLAYS,
  DISCORDBOT: DISCORDBOT
};
