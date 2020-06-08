SEOfflinePoints = require('../modules/se_offline_points/SEOfflinePoints.js');
RandomWord = require('../modules/random_word/RandomWord.js');

module.exports = (TWITCHBOT, channel, status, data) => {
  //status === stream-up or stream-down
  /*
  console.log('Status: ', status);
  console.log('Time: ' + data.time);
  console.log('Channel: ' + data.channel_name);
  */
  if (status === 'stream-up') {
    process.env.LIVE = true;
    RandomWord.online(TWITCHBOT, channel);
  } else if (status === 'stream-down') {
    process.env.LIVE = false;
    RandomWord.offline();
  };

  SEOfflinePoints.main(TWITCHBOT, channel, status, data);

};
