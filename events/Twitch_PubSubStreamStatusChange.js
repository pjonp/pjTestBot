const modules = [
  require('../modules/.Twitch_Games/RandomWord.js'),
  require('../modules/.Twitch_Games/WordLadder.js'),
  require('../modules/.Twitch_Games/ScrambleWord.js'),
  require('../modules/.Twitch_Games/RandomPasscode.js'),
  require('../modules/.Twitch_Util/SEOfflinePoints.js'),
  require('../modules/.Discord_Util/DiscordTwitchStatusEmbed.js')
];

module.exports = (TWITCHBOT, room, status, data) => {
  room = room.replace('#', '');
  //status === stream-up or stream-down
  /*
  console.log('Status: ', status);
  console.log('Time: ' + data.time);
  console.log('Channel: ' + data.channel_name);
  */
  if (status === 'stream-up') {
    process.env.LIVE = true;
    console.log(process.env.T_ONLINEMSG);
    TWITCHBOT.say(room, process.env.T_ONLINEMSG).catch((err) => console.error(err));
    modules.forEach(i => i.online(TWITCHBOT, room, data) );
  } else if (status === 'stream-down') {
    process.env.LIVE = false;
    console.log(process.env.T_OFFLINEMSG);
    TWITCHBOT.say(room, process.env.T_OFFLINEMSG).catch((err) => console.error(err));
    modules.forEach(i => i.offline(TWITCHBOT, room, data) );
  };

};
