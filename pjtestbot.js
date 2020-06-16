// BOT OAUTH LINK https://id.twitch.tv/oauth2/authorize?response_type=token&client_id=   T_APPCLIENTID   &redirect_uri=https://twitchapps.com/tmi/&scope=chat:read+chat:edit+whispers:read+whispers:edit+clips:edit+channel:moderate
// YOUR OAUTH LINK BOT OAUTH LINK https://id.twitch.tv/oauth2/authorize?response_type=token&client_id=   T_APPCLIENTID   &redirect_uri=https://twitchapps.com/tmi/&scope=clips:edit+channel:read:redemptions
const Discord = require('discord.js'),
  Twitch = require('tmi.js'),
  TwitchPS = require('twitchps'),
  path = require("path"),
  envvars = require('dotenv').config({ path: path.resolve(process.cwd(), './.hidden/.env') }),
  DISCORDBOT = new Discord.Client(),
  D_OWNERNAME = process.env.D_OWNERNAME, //lowercase
  D_OWNERID = process.env.D_OWNERID,
  io = require("socket.io"),
  OVERLAYS = io.listen('7654');

//START DISCORD
DISCORDBOT.login(process.env.D_TOKEN).catch(err => {
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
    username: process.env.T_BOTUSERNAME,
    password: `oauth:${process.env.T_BOTOAUTHTOKEN}`
  },
  channels: [process.env.T_CHANNELNAME]
});

TWITCHBOT.connect().catch((err) => {
  console.log('****Twitch Connection Error:', err);
});

//Twitch PubSub
//Initial topics are required
const init_topics = [{
    topic: `video-playback.${process.env.T_CHANNELNAME}`
  }, {
    topic: `channel-points-channel-v1.${process.env.T_CHANNELID}`,
    token: process.env.T_OAUTHTOKEN
  } /*, {topic: `whispers.${process.env.T_BOTCHANNELID}`, token: process.env.T_BOTOAUTHTOKEN} */ ],
  TWITCHPUBSUB = new TwitchPS({
    init_topics: init_topics,
    reconnect: true,
    debug: false
  });

//Stream Elements overlays
OVERLAYS.on('connection', socket => {
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
require('./util/TwitchPubSubEventLoader')(TWITCHPUBSUB, TWITCHBOT, process.env.T_CHANNELNAME);

module.exports = {
  DISCORDBOT: DISCORDBOT,
  OVERLAYS: OVERLAYS,
  TWITCHBOT: TWITCHBOT
};

//setTimeout( () => require('./events/Twitch_PubSubStreamStatusChange')(TWITCHBOT, process.env.T_CHANNELNAME, 'stream-up', {}),10000); //Start online
//setTimeout( () => require('./events/Twitch_PubSubStreamStatusChange')(TWITCHBOT, process.env.T_CHANNELNAME, 'stream-down', {}),45000); //go offline
//require('./modules/reveal_game/DatabaseBuilder.js').main(); //for building reveal game Database
