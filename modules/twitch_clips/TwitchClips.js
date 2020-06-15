const DISCORDBOT = require('../../pjtestbot.js').DISCORDBOT,
  fetch = require('node-fetch'),
  fs = require('fs'),
  path = require("path"),
  SettingsFile = path.resolve(process.cwd(), './.settings/TwitchClipSettings.json'),
  settings = JSON.parse(fs.readFileSync(SettingsFile)),
  Cryptr = require('cryptr');

let streamerID = process.env.T_CHANNELID,
  onCooldown = false,
  cooldownLength = 45;

let cryptr = new Cryptr(process.env.SECRET);

module.exports = {
  command: settings.twitchChatCommand,
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
      clipUser,
      clipUserToken;

    BotResponse(TWITCHBOT, room, user.username, res);
    let userData = await getUserData (user['user-id']);

    if(!userData || userData.error) {
      clipUser = null;
      clipUserToken = null;
    } else {
      clipUser = userData.d_id
      clipUserToken = cryptr.decrypt(userData.t_token);
    };
    let getClipLink = await CreateTwitchClip(clipUserToken);
    if (getClipLink.status === 401) { //if invalid token
      getClipLink = await CreateTwitchClip(null); //retry with no token
    };
    if (getClipLink.error != undefined) {
      if (getClipLink.status === 404) { //channel is offline
        res.msg = 'Channel is offline!'
        BotResponse(TWITCHBOT, room, user.username, res);
        return;
      } else {
        discordRes = `Error Saving Clip For ${user.username}`;
      };
    } else {
      discordRes = clipUser ? `<@${clipUser}> Created A Clip! ${getClipLink.data[0]['edit_url']}` : `${user.username} Created A Clip! ${getClipLink.data[0]['edit_url']}`;
    };
    DISCORDBOT.channels.fetch(settings.discordClipChannel).then(channel => {
        setTimeout(() => {
          channel.send(discordRes)
        }, 30000)
      })
      .catch(console.error);
  }
};

const CreateTwitchClip = (clipUserToken) => {
  return fetch(`https://api.twitch.tv/helix/clips?broadcaster_id=${streamerID}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${clipUserToken || process.env.T_BOTOAUTHTOKEN}`,
        //'Client-ID': process.env.T_APPCLIENTID
        'Client-ID': clipUserToken ? process.env.PJSAPPCLIENTID : process.env.T_APPCLIENTID //testing
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

const getUserData = (userid) => {
  return fetch(`https://pjtestsite.herokuapp.com/api/clipinfo/${userid}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
    })
    .then(async response => {
      if (!response.ok) {
        console.log(await response.json());
        throw new Error();
      };
      return response.json();
    })
    .catch(error => {
      console.error(`Error Reading External API`)
      return false;
    });
};
