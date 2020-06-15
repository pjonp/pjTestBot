const fetch = require('node-fetch'),
  BulkPutPointsToSE = require('../../util/StreamElementsAPI.js').BulkPutPointsToSE,
  fs = require('fs'),
  path = require("path"),
  SettingsFile = path.resolve(process.cwd(), './.settings/SEOfflinePointsSettings.json'),
  settings = JSON.parse(fs.readFileSync(SettingsFile));

let streamOnline = true,
  res = '',
  timer;

module.exports = {
  online: (TWITCHBOT, channel, data) => {
    clearInterval(timer);
    streamOnline = true;
  },
  offline: (TWITCHBOT, channel, data) => {
    clearInterval(timer);
    streamOnline = false;
    timer = setInterval(() => buildChatterData(TWITCHBOT, channel), settings.timerDelay * 1000);
  }
};

const buildChatterData = async (TWITCHBOT, channel) => {
  let chatterList = await getChatters(channel);
  chatterList = chatterList.filter(i => !settings.ignoredChatters.some(j => i === j)); //remove ignoredChatters

  if (chatterList.length === 0) {
    console.log('There are no users in chat.');
    return;
  }
  let response = await BulkPutPointsToSE(chatterList, settings.points);
  if (response) {
    let res = `${settings.points}HP added to ${chatterList.length} lurkers TakeNRG`
    //  TWITCHBOT.say(channel, res).catch((err) => console.error(err));
    console.log(res);
    if (settings.showLog) console.log(chatterList);
  };
  return;
}
const getChatters = (channel) => {
  return fetch(`https://tmi.twitch.tv/group/user/${channel}/chatters`, {
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
    .then((data) => {
      let chatterList = [];
      Object.keys(data.chatters).forEach(i => {
        chatterList.push(data.chatters[i]);
      });
      return chatterList.flat();
    })
    .catch(error => {
      console.error(error, `Error Getting Chatter List:`)
      return [];
    });
};
