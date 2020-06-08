const fetch = require('node-fetch'),
  BulkPutPointsToSE = require('../../util/StreamElementsAPI.js').BulkPutPointsToSE;

let streamOnline = true,
  res = '',
  timer,
  // **SETTINGS BELOW**
  showLog = false, //show list of users during each interval
  timerDelay = 60, //seconds 1800 = 30minutes
  points = 123,
  ignoredChatters = [process.env.T_BOTUSERNAME, 'commanderroot', 'streamelements'];
// **SETTINGS ABOVE**

module.exports = {
  main: (TWITCHBOT, channel, status, data) => {
    channel = channel.replace('#', '');
    clearInterval(timer);
    if (status === 'stream-up') {
      streamOnline = true
      res = 'Welcome to the stream!'
    } else if (status === 'stream-down') {
      streamOnline = false
      res = 'See you all soon!'
      timer = setInterval(() => buildChatterData(TWITCHBOT, channel), timerDelay * 1000);
    } else {
      console.error('Could not determine Stream Online/Offline Status');
      return;
    }
    TWITCHBOT.say(channel, res).catch((err) => console.error(err));
  }
};

const buildChatterData = async (TWITCHBOT, channel) => {
  let chatterList = await getChatters(channel);
  chatterList = chatterList.filter(i => !ignoredChatters.some(j => i === j)); //remove ignoredChatters

  if (chatterList.length === 0) {
    console.log('There are no users in chat.');
    return;
  }
  let response = await BulkPutPointsToSE(chatterList, points);
  if (response) {
    let res = `${points}HP added to ${chatterList.length} lurkers TakeNRG`
  //  TWITCHBOT.say(channel, res).catch((err) => console.error(err));
    console.log(res);
    if(showLog) console.log(chatterList);
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
