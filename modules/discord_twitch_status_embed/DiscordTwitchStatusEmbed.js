const DISCORDBOT = require('../../pjtestbot.js').DISCORDBOT,
  fs = require('fs'),
  path = require("path"),
  SettingsFile = path.resolve(process.cwd(), './.settings/DiscordTwitchStatusEmbedSettings.json'),
  settings = JSON.parse(fs.readFileSync(SettingsFile)),
  DataFile = path.resolve(__dirname, './DiscordTwitchStatusEmbedData.json'),
  savedData = JSON.parse(fs.readFileSync(DataFile)),
  TwitchAPI = require('../../util/TwitchAPI.js');

let timer;
// let testingId = '31673862';
module.exports = {
  online: async (TWITCHBOT, room, data) => {
    clearInterval(timer);
    try {
    DISCORDBOT.channels.fetch(savedData.discordTwitchStatusMessage.channelID)
      .then(channel => {
        channel.messages.fetch(savedData.discordTwitchStatusMessage.id)
          .then(message => message.delete()).catch(e => console.error(`Previous Discord Status Embed doesn't exists or couldn't be deleted`));
      })
      .catch(e => console.error(`No Previous Twitch Embed Found`));
    } catch {
      console.error(`No Previous Twitch Embed Found`)
    };

    let embedObj = await buildEmbedObject(settings.embedOnlineMsg);
    if (!embedObj) {
      return;
    } else {
      let embed = embedObj.embed;
      DISCORDBOT.channels.fetch(settings.discordTwitchStatusChannel).then(channel => {
          channel.send(embedObj.content || '', {
            embed
          }).then(msg => {
            savedData.discordTwitchStatusMessage = msg;
            SaveSettings();
          })
        })
        .catch(console.error, 'error 3032');
    };
    timer = setInterval(() => updateEmbed(settings.embedUpdateMsg), 180000);
  },
  offline: async (TWITCHBOT, room, data) => {
    clearInterval(timer);
    if (settings.deleteEmbedWhenOffline) {
      try {
        savedData.discordTwitchStatusMessage.delete().then(message => {
          savedData.discordTwitchStatusMessage = {};
          SaveSettings();
        }).catch(console.error);
      } catch {
        console.log('Discord Status Embed Not Found');
      };
    } else {
      updateEmbed(settings.embedOfflineMsg);
    }
  }
};

const buildEmbedObject = async (settingsEmbed) => {
  let streamData = await getStreamData().catch(e => {
    return e
  });
  if (!streamData) {
    console.log('NO STREAM DATA');
    return null;
  };
  let embedJSON = JSON.stringify(settingsEmbed);
  Object.keys(streamData).forEach(i => {
    regex = new RegExp(`{{${i}}}`, "gi");
    embedJSON = embedJSON.replace(regex, streamData[i]);
  });
  return JSON.parse(embedJSON);
};

const updateEmbed = async (settingsEmbed) => {
  let embedObj = await buildEmbedObject(settingsEmbed);
  if (!embedObj) {
    return;
  } else {
    let embed = embedObj.embed;
    savedData.discordTwitchStatusMessage.edit(embedObj.content || '', {
        embed
      })
      .then(msg => {
        savedData.discordTwitchStatusMessage = msg;
        console.log(`Twitch Status Embed Updated`);
        SaveSettings();
      })
      .catch(e => console.error(e, `!!! Twitch Status Embed Updating ERROR ^^...`));
  };
};

const getStreamData = (userID) => {
  return new Promise((resolve, reject) => {
  //  TwitchAPI.GetStreamData(testingId).then(sData => {
    TwitchAPI.GetStreamData(process.env.T_CHANNELID).then(sData => {
      sData = sData.data[0];
      TwitchAPI.GetGameData(sData.game_id).then(gData => {
        gData = gData.data[0];
        increaseImageSize();
        let streamObj = {
          channelName: process.env.T_CHANNELNAME,
          channelUrl: `https://www.twitch.tv/${process.env.T_CHANNELNAME}`,
          channelIcon: settings.channelIcon,
          title: sData.title,
          currentViewers: sData.viewer_count,
          streamStart: sData.started_at,
          uptime: getUptime(sData.started_at),
          streamPreview: sData.thumbnail_url.replace('{width}', savedData.thumbnail_urlWidth).replace('{height}', savedData.thumbnail_urlHeight),
          game: gData.name,
          gameArt: gData.box_art_url.replace('{width}', '375').replace('{height}', '500'),
        }
        resolve(streamObj);
      })
    }).catch(e => {
      console.log(e, '!!Error Getting Twitch Stream & Game Info ^^ ...');
      reject();
    });
  });
};

const SaveSettings = () => {
  try {
    fs.writeFileSync(DataFile, JSON.stringify(savedData, null, 2), "utf8");
    console.log(`Discord Status Embed File Saved!`);
  } catch {
    console.error(`!!!! Error Saving Discord Status Embed Settings File`);
  };
  return;
};

const getUptime = (start) => {
  let milliseconds = new Date() - new Date(start),
    hours = Math.floor(milliseconds / 3600000);
  minutes = Math.round((milliseconds % 3600000) / 60000);
  return `${hours} ${hours === 1 ? 'hour' : 'hours'}, ${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`
}

const increaseImageSize = () => {
  let maxWidth = Math.round(savedData.thumbnail_urlHeight / 0.5625) + 30;
  if (savedData.thumbnail_urlWidth > maxWidth) {
    savedData.thumbnail_urlHeight++;
    savedData.thumbnail_urlWidth = Math.round(savedData.thumbnail_urlHeight / 0.5625) - 30;
  } else {
    savedData.thumbnail_urlWidth++
  };
  return;
};
