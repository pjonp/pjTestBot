const Commands = [
    require('../modules/.Twitch_Games/SecretWord.js'),
    require('../modules/.Twitch_Games/DefuseGame.js'),
    require('../modules/.Twitch_Games/WordLadder.js'),
    require('../modules/.Twitch_Games/RandomWord.js'),
    require('../modules/.Twitch_Games/ScrambleWord.js'),
    require('../modules/.Twitch_Games/RandomPasscode.js'),
    require('../modules/.Twitch_Util/TwitchClips.js')
  ],
  UnityGame = require('../modules/unity_game/UnityGame.js'),
  TwitchStreamStatus = require('./Twitch_PubSubStreamStatusChange'),
  SECommands = require('../modules/.Discord_Util/seFromDiscord.js');

//Commands = . load all JS files + ADD TwitchClips
module.exports = (TWITCHBOT, room, user, message, self) => {
  if(process.env.WAITINGFORTWITCHCOMMAND === 'true') SECommands.response(user, message, self);
  if (self) return;
  UnityGame.main(TWITCHBOT, room, user, message);

  Commands.forEach(command => {
    if (user['message-type'] === 'whisper' && message.startsWith(command.settings.chatCommand)) {
      command.update(TWITCHBOT, room, user, message);
    } else if (user['message-type'] !== 'whisper') {
      command.main(TWITCHBOT, room, user, message);
    };
  });


  //--- SE Offline Points ---
  if (user.username === process.env.T_CHANNELNAME) {
    switch (message.split(' ')[0]) {
      case '!online':
      TwitchStreamStatus(TWITCHBOT, process.env.T_CHANNELNAME, 'stream-up', {});
        break;
      case '!offline':
        TwitchStreamStatus(TWITCHBOT, process.env.T_CHANNELNAME, 'stream-down', {});
        break;
      case '%build':
        buildPyramid()
        break;
      default:
        break;
    };
  };
  //--- SE Offline Points ---

  //Pyramid Builder  //use %build # {emote}  where # 'summit'
  const buildPyramid = () => {
    let msgA = message.split(' '),
      summit = parseInt(msgA[1].replace('%build', '')),
      width = (summit * 2) + 1,
      height = 1,
      emote = msgA[2];
    if (!emote) return;
    for (let i = 1; i < width + 1; i++) {
      let res = ''
      for (let j = 0; j < height; j++) {
        res += ` ${emote} `
      }
      setTimeout(() => TWITCHBOT.say(room, res), i * 100); //0.150 sec spam
      if (i >= summit) {
        height--
      } else {
        height++
      };
    }
  };
}; //end exports
