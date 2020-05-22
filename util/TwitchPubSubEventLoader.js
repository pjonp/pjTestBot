const reqEvent = (event) => require(`../events/${event}`);

module.exports = (TWITCHPUBSUB,TWITCHBOT,channel) => {
  TWITCHPUBSUB.on('connected', (data) => {
    console.log('+++PJ TEST BOT CONNECTED TO TWITCH PUBSUB');
  });
  TWITCHPUBSUB.on('disconnected', (data) => {
    console.log('!!!PJ TEST BOT *LOST* CONNECTION TO TWITCH PUBSUB');
  });
  TWITCHPUBSUB.on('reconnect', (data) => {
    console.log('...reconnecting to Twitch PubSub');
  });
  //Examples of all types of events to listen for see https://github.com/jctrvlr/twitchPS
  TWITCHPUBSUB.on('whisper_received', (data) => reqEvent('Twitch_PubSubWhisperReceived')(TWITCHBOT, data));
  TWITCHPUBSUB.on('stream-up', (data) => reqEvent('Twitch_PubSubStreamStatusChange')(TWITCHBOT, channel, 'stream-up', data));
  TWITCHPUBSUB.on('stream-down', (data) => reqEvent('Twitch_PubSubStreamStatusChange')(TWITCHBOT, channel, 'stream-down', data));
  TWITCHPUBSUB.on('channel-points', (data) => reqEvent('Twitch_PubSubChannelPoints')(TWITCHBOT, channel, data));
};
