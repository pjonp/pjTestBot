//Logging
let logRedemtions = false,
  fs,
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
      break;
    case '33eccc5d-509a-49ed-baf1-ec5dc7b14bdd': //!hpbombs
      res = `!hpbombs`
      break;
    case '72278053-de5a-423c-b20a-e895ffa0e11d': //!addhp all 60
      res = `!addhp all 60`
      break;
    case 'c1e6c76f-11ed-41d7-ac9f-4757bd1ba4cd': //!addhp username 1500
      res = `!addhp ${data.redemption.user['display_name']} 1500`
      break;
    case '???': //!addhp username 6500
      res = `!addhp ${data.redemption.user['display_name']} 6500`
      break;
    case '8b1106f4-2603-4917-8d81-cb635c4b4a8a': //!!addhp username 10000
      res = `!addhp ${data.redemption.user['display_name']} 10000`
      break;
    case '??': //!so @username (shoutout)
      res = `!so @username (shoutout)`
      break;
    case '???': //Emotes only (5 minutes)
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
    default:
      return;
      break;
  };
  TWITCHBOT.say(channel, res).catch((err) => console.error(err));
};
