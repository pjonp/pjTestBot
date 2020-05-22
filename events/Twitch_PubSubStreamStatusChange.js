SEOfflinePoints = require('../modules/se_offline_points/SEOfflinePoints.js');

module.exports = (TWITCHBOT, channel, status, data) => {
  //status === stream-up or stream-down
  /*
  console.log('Status: ', status);
  console.log('Time: ' + data.time);
  console.log('Channel: ' + data.channel_name);
  */
SEOfflinePoints.main(TWITCHBOT, channel, status, data);
};
