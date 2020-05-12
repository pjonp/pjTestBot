
//https://id.twitch.tv/oauth2/authorize?response_type=token&client_id=czrx5slyrz4827q9hj48x7vky5lh58&redirect_uri=https://twitchapps.com/tmi/&scope=chat:read+chat:edit+channel:moderate+whispers:read+whispers:edit+channel_editor+clips:edit

const Discord = require('discord.js'),
  Twitch = require('tmi.js'),
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

//Stream Elements overlays
SE_OVERLAYS.on('connection', socket => {
  console.log('connection made...');
  socket.on('overlayLoaded', overlay => {
    console.log(`***Overlay Loaded: ${overlay}`);
  });
})
module.exports = {
  SE_OVERLAYS: SE_OVERLAYS
}
/*
let names = require('./modules/pokedex.json');
let longName = 'd'
for(let i = 0; i < names.length; i++) {
  if(names[i].name.english.length > longName.length) {
    longName = names[i].name.english
  }
}
console.log(longName);
//12 characters



const fetch = require('node-fetch'),
setup = require('./.hidden/settings.json');
let test = () => {
//return fetch(`https://tmi.twitch.tv/group/user/maxmagus/chatters`, {
  return fetch(`https://api.twitch.tv/helix/streams?user_login=maxmagus`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${setup.T_OAUTHTOKEN.replace('oauth:', '')}`,
      'Client-ID': setup.T_CLIENTID
   },
  })
  .then(async response => {
    if (!response.ok) {
      console.log(await response.json());
      throw new Error();
    };
    console.log(await response.json());
  })
  .catch(error => {
    console.error(`Error`)
    return false;
  });
};
setTimeout( () => test(), 3000);

*/
