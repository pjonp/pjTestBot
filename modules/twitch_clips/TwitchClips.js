//https://id.twitch.tv/oauth2/authorize?response_type=token&client_id=czrx5slyrz4827q9hj48x7vky5lh58&redirect_uri=https://twitchapps.com/tmi/&scope=clips:edit
const DISCORDBOT = require('../../pjtestbot.js').DISCORDBOT,
  fetch = require('node-fetch'),
  settings = require('./TwitchClipSettings.json')
  setup = require('../../.hidden/settings.json');

let streamerID = '232672264', //setup.T_CHANNELID, //for testing
  command = settings.twitchChatCommand,
  discordClipChannel = settings.discordClipChannel,
  onCooldown = false,
  cooldownLength = 30;

module.exports = {
  command: command,
  main: async (TWITCHBOT, room, user, message) => {
    if (onCooldown) return;
    onCooldown = true
    setTimeout(() => {
      onCooldown = false;
    }, cooldownLength * 1000) //cooldown seconds
    //Twitch Response
    let res = {
      type: 'action',
      msg: `Attempting to save clip. Check Discord Clip Channel!`
    },
    discordRes,
    getID;

    BotResponse(TWITCHBOT, room, user.username, res);

    try {
      getID = settings.users.find(i => i.name === user.username).id;
    } catch {
      getID = null
    }
    let getClipLink = await CreateTwitchClip(getID);
    if(getClipLink.status === 401) { //if invalid token
      getClipLink = await CreateTwitchClip(null); //retry with no token
    };
    if (getClipLink.error != undefined) {
      console.log(getClipLink);
      if (getClipLink.status === 404) { //channel is offline
        res.msg = 'Channel is offline!'
        BotResponse(TWITCHBOT, room, user.username, res);
        return;
      } else {
        discordRes = `Error Saving Clip For ${user.username}`;
      };
    } else {
      discordRes = `${user.username} Created A Clip! ${getClipLink.data[0]['edit_url']}`;
    };

    DISCORDBOT.channels.fetch(discordClipChannel).then(channel => {
        setTimeout(() => {
          channel.send(discordRes)
        }, 20000)
      })
      .catch(console.error);
  }
};

const CreateTwitchClip = (clipperID) => {
  return fetch(`https://api.twitch.tv/helix/clips?broadcaster_id=${streamerID}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${clipperID || setup.T_OAUTHTOKEN.replace('oauth:', '')}`,
        'Client-ID': setup.T_CLIENTID
      },
    })
    .then(response => response.json())
    .then(data => {
      return data;
    })
    .catch(error => {
      console.error(`Error Creating Clip`)
      return false;
    });
};

const BotResponse = (TWITCHBOT, room, username, res) => {
  if (res.type === 'whisper') {
    TWITCHBOT.whisper(username, res.msg).catch((err) => {
      console.log(err)
    });
  } else if (res.type === 'action') {
    TWITCHBOT.action(room, res.msg).catch((err) => {
      console.log(err)
    });
  } else {
    TWITCHBOT.say(room, res.msg).catch((err) => {
      console.log(err)
    });
  };
  return res;
};
