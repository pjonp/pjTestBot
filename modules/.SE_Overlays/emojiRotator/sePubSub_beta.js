/*
Copyright 2021 pjonp
This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/
class TwitchPubSub {
  constructor(channel) {
    this.topic = `dashboard-activity-feed.${channel}`;
  };

  connect() {
    return new Promise((res,rej) => {
      setTimeout(_=> {
        this.connection = new WebSocket('wss://pubsub-edge.twitch.tv');
        this.connection.onopen = this.onOpen.bind(this);
        this.connection.onmessage = this.onRedeem.bind(this);
        this.connection.onclose = this.onClose.bind(this);
        res();
      }, 7500);
    })
  };

  onOpen() {
    console.log('PubSub Opened');
    this.ping();
    this.listen();
    this.heartbeat = setInterval(this.ping.bind(this), 1000 * 120);
  };

  listen() {
    this.connection.send(
      JSON.stringify({
        type: 'LISTEN',
        data: {
          topics: [this.topic],
          auth_token: this.token
        }
      }));
  };

  onClose() {
    console.log('PubSub Closed ', Date.now());
    clearInterval(this.heartbeat);
  };

  ping() {
    console.log('PubSub Ping ', Date.now());
    this.connection.send(JSON.stringify({
      type: 'PING'
    }));
  };

  reconnect() {
    console.log('PubSub connection closed By Twitch ', Date.now());
    this.connection.close();
    //handle force reconnect... tbd
  };

  onRedeem({ data: psObject }) {
    psObject = JSON.parse(psObject);
    if (psObject.type === 'RESPONSE') return;
    else if (psObject.type === 'PONG') return;
    else if (psObject.type === 'RECONNECT') return this.reconnect();
    else if (psObject.type === 'MESSAGE' && psObject.data.topic === this.topic) {
      let message = JSON.parse(psObject.data.message);
      if (message.type === 'channel_points_custom_reward_redemption') return this.emitPuSub(message);
    };
  };

  emitPuSub(message) {
    const channelPointEvent = new CustomEvent("onEventReceived", {
      detail: {
        "listener": "reward-redeemed",
        "event": {
          "service": "twitch",
          "data": {
            "time": new Date(message.timestamp).getTime(),
            "tags": message,
            "nick": message.channel_points_redeeming_user.login,
            "userId": message.channel_points_redeeming_user.id,
            "displayName": message.channel_points_redeeming_user.display_name,
            "text": message.channel_points_user_input,
            "rewardId": message.channel_points_reward_id,
            "rewardTitle": message.channel_points_reward_title,
            "id": message.channel_points_redemption_id,
          },
        },
      }
    });
    window.dispatchEvent(channelPointEvent);
  };
};

/*
window.addEventListener('onWidgetLoad', obj => {
  new TwitchPubSub(obj.detail.channel.providerId).connect();
});

window.addEventListener('onEventReceived', obj => {
  const event = obj.detail.event;
  if (obj.detail.listener === 'reward-redeemed') {
    console.log('SE Output ', event);
    //do stuff
  };
});

let exampleEvent =
{
    "service": "twitch",
    "data": {
        "time": 1633579908448,
        "tags": {
            "id": "b7ae9286-01f1-4ea1-a0bc-f9ba66944ad5",
            "timestamp": "2021-10-07T04:11:48.448Z",
            "type": "channel_points_custom_reward_redemption",
            "channel_points_redemption_id": "367e4ce2-d240-48d3-8ada-22c0a7aa2a7c",
            "channel_points_redeeming_user": {
                "id": "43165806",
                "login": "pjonp",
                "display_name": "pjonp"
            },
            "channel_points_reward_id": "e140a91b-7df1-4d11-a19e-e8e313e2e07d",
            "channel_points_reward_title": "HP Bomb!",
            "channel_points_user_input": ""
        },
        "nick": "pjonp",
        "userId": "43165806",
        "displayName": "pjonp",
        "text": "",
        "rewardId": "e140a91b-7df1-4d11-a19e-e8e313e2e07d",
        "rewardTitle": "HP Bomb!",
        "id": "367e4ce2-d240-48d3-8ada-22c0a7aa2a7c"
    }
}

*/
