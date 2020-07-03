//Logging
let logRedemtions = false,
  fs,
  queue = [],
  waiting = false,
  path,
  logFile,
  log;

if (logRedemtions) {
  fs = require('fs'),
    path = require("path"),
    logFile = path.resolve(__dirname, './logFile.json');
  log = JSON.parse(fs.readFileSync(logFile));
};

module.exports = (TWITCHBOT, channel, data) => {
  let itemId,
    queuedEvent = false;
  res = '';
  try {
    itemId = data.redemption.reward.id
  } catch {
    console.error('Error: Redemption ID Not Found');
    return;
  }

  //Logging
  if (logRedemtions) {
    log.push(data)
    fs.writeFileSync(logFile, JSON.stringify(log, null, 4), 'UTF-8')
  };

  switch (itemId) {
    case 'e140a91b-7df1-4d11-a19e-e8e313e2e07d': //!hpbomb
      res = `!hpbomb`
      queue.push(res);
      queuedEvent = true;
      break;
    case '33eccc5d-509a-49ed-baf1-ec5dc7b14bdd': //!hpbombs
      res = `!hpbombs`
      queue.push(res);
      queuedEvent = true;
      break;
    case '72278053-de5a-423c-b20a-e895ffa0e11d': //!addhp all 60
      res = `!addhp all 60`
      break;
    case 'c1e6c76f-11ed-41d7-ac9f-4757bd1ba4cd': //!addhp username 1500
      res = `!addhp ${data.redemption.user['display_name']} 1500`
      break;
    case '7d13ef20-1c87-4ce0-a5de-c1bb8551bd1b': //!addhp username 6500
      res = `!addhp ${data.redemption.user['display_name']} 6500`
      break;
    case '8b1106f4-2603-4917-8d81-cb635c4b4a8a': //!!addhp username 10000
      res = `!addhp ${data.redemption.user['display_name']} 10000`
      break;
    case 'a6370bda-e98b-4521-a19f-d06579c39e46': //!so @username (shoutout)
      res = `!so @${data.redemption.user['display_name']}`
      break;
    case '845a7cea-a803-4b35-8a91-540b5909a098': //Emotes only (5 minutes)
      res = `Talk with pictures for 5 minutes!`
      TWITCHBOT.emoteonly(channel).then((data) => console.log('!!!EMOTE ONLY MODE ENABLED')).catch((err) => console.error(err));
      setTimeout(() => TWITCHBOT.emoteonlyoff(channel).then((data) => console.log('+++EMOTE ONLY MODE DISABLED')).catch((err) => console.error(err)), 5 * 60 * 1000)
      break;
    case '569e63f3-3e03-4b8e-af4d-4954371a7cfe': //Emote Pyramids
      res = `!module pyramid enable`
      break;
    case 'a80c8208-f055-4b3b-8d26-0386bf022198': //!bingo twitch
      res = `!bingo twitch`
      break;
    case 'de71e3e6-7ec7-4489-8787-98d5c1d2f3bd': //!nuke
      nukeChat(TWITCHBOT, channel);
      return;
    default:
      return;
  };
  if (queuedEvent) {
    checkQueue(TWITCHBOT, channel);
  } else {
    TWITCHBOT.say(channel, res).catch((err) => console.error(err));
  };
};

const checkQueue = (TWITCHBOT, channel) => {
  if (queue.length === 0 || waiting) return;
    waiting = true;
    TWITCHBOT.say(channel, queue[0]).catch((err) => console.error(err));
    setTimeout(() => {
      waiting = false;
      queue.shift();
      checkQueue(TWITCHBOT, channel);
    }, 35 * 1000);
};

const nukeChat = (TWITCHBOT, channel) => {
  let res = [
      'THIS WORLD WILL BE TERMINATED... NICE KNOWING YOU ALL...',
      'NUCLEAR LAUNCH DETECTED...',
      '5',
      '4',
      '3',
      '2',
      '1',
      'Hello New World'
    ],
    time = 0;
  for (let i = 0; i < res.length; i++) {
    i === 1 || i === 2 ? time += 5000 : time += 1000;
    setTimeout(() => {
      if (i === res.length - 1) {
        TWITCHBOT.clear(channel)
          .then((data) => {
            setTimeout(() => {
              TWITCHBOT.action(channel, res[res.length - 1]).catch((err) => console.error(err));
            }, 3000);
          }).catch((err) => {
            console.error(err, 'Could Not Nuke Chat');
          });
      } else {
        TWITCHBOT.action(channel, res[i]).catch((err) => console.error(err));
      };
    }, time);
  };
};
