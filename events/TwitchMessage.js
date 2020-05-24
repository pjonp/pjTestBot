const setup = require('../.hidden/settings.json'),
  SecretWord = require('../modules/secret_word/SecretWord.js'),
  DefuseGame = require('../modules/defuse_game/DefuseGame.js'),
  WordLadder = require('../modules/word_ladder/WordLadder.js'),
  // moved to StreamElements  Overlay
  //  RevealGame = require('../modules/reveal_game/RevealGame.js'),
  TwitchClips = require('../modules/twitch_clips/TwitchClips.js'),
  SEOfflinePoints = require('./Twitch_PubSubStreamStatusChange.js');

module.exports = (TWITCHBOT, room, user, message, self) => {
  if (self) return;

  // -----SecretWord---------
  if (user['message-type'] === 'whisper' && message.startsWith(SecretWord.settings.chatCommand)) {
    SecretWord.update(TWITCHBOT, room, user, message);
  } else if (SecretWord.settings.enabled && user['message-type'] !== 'whisper') {
    SecretWord.main(TWITCHBOT, room, user, message);
  };
  // -----End SecretWord-----

  // -----Defuse Game--------
  if (message.startsWith(DefuseGame.settings.chatCommand)) {
    if (user['message-type'] === 'whisper') {
      DefuseGame.update(TWITCHBOT, room, user, message);
    } else if (DefuseGame.settings.enabled) {
      DefuseGame.main(TWITCHBOT, room, user, message);
    };
  };
  // -----End Defuse Game----

  // -----WordLadder---------
  if (user['message-type'] === 'whisper' && message.startsWith(WordLadder.settings.chatCommand)) {
    WordLadder.update(TWITCHBOT, room, user, message);
  } else if (WordLadder.settings.enabled && user['message-type'] !== 'whisper') {
    WordLadder.main(TWITCHBOT, room, user, message);
  };
  // -----End WordLadder-----

  // -----Reveal Game--------
  /* Moved to STREAM ELEMENTS OVERLAY!!
  if (message.startsWith(RevealGame.settings.chatCommand)) {
      if (user['message-type'] === 'whisper') {
      RevealGame.update(TWITCHBOT, room, user, message);
    } else if (RevealGame.settings.running && room === RevealGame.settings.channel) {
      RevealGame.main(TWITCHBOT, room, user, message);
    };
  };
  */
  // -----End Reveal Game----

  // -----Twitch Clips -----

  if (message.startsWith(TwitchClips.command)) {
    if (user['message-type'] !== 'whisper') {
      TwitchClips.main(TWITCHBOT, room, user, message);
    };
  };
  // -----Twitch Clips -----


  //--- SE Offline Points ---
  if (user.username === setup.T_CHANNELNAME) {
    switch (message.split(' ')[0]) {
      case '!online':
        SEOfflinePoints(TWITCHBOT, room, 'stream-up', {});
        break;
      case '!offline':
        SEOfflinePoints(TWITCHBOT, room, 'stream-down', {});
        break;
      default:
        break;
    };
  };
  //--- SE Offline Points ---


  //Pyramid Builder  //use %build # {emote}  where # 'summit'
  if (user.username === setup.T_CHANNELNAME && message.startsWith('%build')) {
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

};

/*
let canEdit = WordLadder.settings.modControl && user.mod;
if (user.badges.broadcaster || canEdit) {
  WordLadder.update(TWITCHBOT, room, user, message);
};
*/
