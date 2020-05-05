const setup = require('../.hidden/settings.json'),
  SecretWord = require('../modules/secret_word/SecretWord.js'),
  DefuseGame = require('../modules/defuse_game/DefuseGame.js');


module.exports = (TWITCHBOT, room, user, message, self) => {
  if (self) return;

  // -----SecretWord---------
  if (user['message-type'] === 'whisper' && message.startsWith(SecretWord.settings.chatCommand)) {
    SecretWord.update(TWITCHBOT, room, user, message);
  } else if (SecretWord.settings.enabled && user['message-type'] !== 'whisper' && room === SecretWord.settings.channel) {
    SecretWord.main(TWITCHBOT, room, user, message);
  };
  // -----End SecretWord-----



  // -----Defuse Game--------
  if (message.startsWith(DefuseGame.settings.chatCommand)) {
      if (user['message-type'] === 'whisper') {
      DefuseGame.update(TWITCHBOT, room, user, message);
    } else if (DefuseGame.settings.enabled && room === DefuseGame.settings.channel) {
      DefuseGame.main(TWITCHBOT, room, user, message);
    };
  };
  // -----End Defuse Game----


  if (user['message-type'] === 'whisper' || room != setup.T_CHANNELNAME[0]) return;
  //  TWITCHBOT.say(room, message).catch((err) => {
  //    console.log(err)
  //  });
};
