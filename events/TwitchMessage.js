const Commands = [
    require('../modules/secret_word/SecretWord.js'),
    require('../modules/defuse_game/DefuseGame.js'),
    require('../modules/word_ladder/WordLadder.js'),
    require('../modules/random_word/RandomWord.js'),
  ],
  UnityGame = require('../modules/unity_game/UnityGame.js'),
  TwitchClips = require('../modules/twitch_clips/TwitchClips.js'),
  SEOfflinePoints = require('./Twitch_PubSubStreamStatusChange.js'),
  SECommands = require('../modules/se_from_discord/seFromDiscord.js');

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

  // -----Twitch Clips -----
  if (message.startsWith(TwitchClips.command)) {
    if (user['message-type'] !== 'whisper') {
      TwitchClips.main(TWITCHBOT, room, user, message);
    };
  };
  // -----Twitch Clips -----


  //--- SE Offline Points ---
  if (user.username === process.env.T_CHANNELNAME) {
    switch (message.split(' ')[0]) {
      case '!online':
        SEOfflinePoints(TWITCHBOT, room, 'stream-up', {});
        break;
      case '!offline':
        SEOfflinePoints(TWITCHBOT, room, 'stream-down', {});
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
