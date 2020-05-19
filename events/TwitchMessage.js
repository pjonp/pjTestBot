const setup = require('../.hidden/settings.json'),
  SecretWord = require('../modules/secret_word/SecretWord.js'),
  DefuseGame = require('../modules/defuse_game/DefuseGame.js'),
// moved to StreamElements  Overlay
//  RevealGame = require('../modules/reveal_game/RevealGame.js'),
  TwitchClips = require('../modules/twitch_clips/TwitchClips.js');


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
      if (user['message-type'] === 'whisper') {
      return;
    } else {
      TwitchClips.main(TWITCHBOT, room, user, message);
    };
  };
  // -----Twitch Clips -----

};
