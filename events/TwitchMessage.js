const setup = require('../.hidden/settings.json'),
  SecretWord = require('../modules/secret_word/SecretWord.js');


module.exports = (TWITCHBOT, room, user, message, self) => {
  if (self) return;

  // -----SecretWord---------
  if (user['message-type'] === 'whisper' && message.startsWith(SecretWord.settings.chatCommand)) {
    SecretWord.update(TWITCHBOT, room, user, message);
  } else if (SecretWord.settings.enabled && user['message-type'] !== 'whisper' && room === SecretWord.settings.channel) {
    SecretWord.main(TWITCHBOT, room, user, message);
  };
  // -----End SecretWord---------

  if (user['message-type'] === 'whisper' || room != setup.T_CHANNELNAME[0]) return;
  //  TWITCHBOT.say(room, message).catch((err) => {
  //    console.log(err)
  //  });
};
