/*
WARNING: This code is untested and not complete!
*/
console.log('load...');

const token = 'here' //needs scope: channel:manage:redemptions
//quick link: https://twitchtokengenerator.com/quick/pRLpQT4p3y

/* Load via HTML <script> */
class PjsTwitchRewards {
  constructor({
    channel,
    token,
    editorMode,
  }) {
    this.channel = channel;
    this.token = token;
    this.editorMode = editorMode === false ? false : true; //force debouncer & errors for undefined/null
    this.topic = `channel-points-channel-v1.${this.channel}`; //`dashboard-activity-feed.${channel}` || `channel-points-channel-v1.${channel}`;
    this.reconnect = this.reconnect.bind(this);
    this.getData = this.getData.bind(this); //use for API calls
  };

  connect() {
    return new Promise((res, rej) => {
      const success = data => { //success (resolve) function
        //start websocket and set functions
        this.connection = new WebSocket('wss://pubsub-edge.twitch.tv');
        this.connection.onopen = this.open.bind(this);
        this.connection.onmessage = this.message.bind(this);
        this.connection.onclose = this.close.bind(this);
        //format resolve object
        let resObj = {
          success: true,
          rewards: data ? data : [],
        };
        //resolve object
        res(resObj);
      };
      const error = errMsg => { //error (reject) function
        let rejObj = {
          error: true,
          message: errMsg ? errMsg : 'No error message defined',
        };
        console.error(rejObj.message);
        if (this.editorMode) this.showError(rejObj.message);
        rej(rejObj);
      };
      //built in debouncer; used to prevent doing API calls and creating websockets ever letter change in an overlay when typing
      //debouncer is only used on the overlay editor
      setTimeout(_ => {
        fetch('https://id.twitch.tv/oauth2/validate', {
            headers: {
              Authorization: `OAuth ${this.token}`,
            },
          })
          .then(response => response.json())
          .then(data => {
            if (data.status > 299) return error(`Twitch Token is not valid or has expired. Error: ${data.message}`); //token check; used over straight reward API call to get clientId (eaiser for User, 1 less input)
            else this.clientId = data.client_id; //set clientId for API call
            if (this.channel !== data.user_id) return error(`Twitch Token does match your userId: This token is for: ${data.login}`); //check token matches user
            if (data.scopes.indexOf('channel:read:redemptions') < 0) return error('Twitch Token does not have scope: channel:read:redemptions'); //check scope
            this.getData(`https://api.twitch.tv/helix/channel_points/custom_rewards?broadcaster_id=${this.channel}`) //API call refactored out
                .then(data => success(data))
                .catch(e => error(e));
          });
      }, this.editorMode ? 5000 : 100);
    });
  };

  open() {
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
          auth_token: this.token,
        },
      }));
  };

  close() {
    console.log('PubSub Closed ', Date.now());
    clearInterval(this.heartbeat);
  };

  ping() {
    console.log('PubSub Ping ', Date.now());
    this.connection.send(JSON.stringify({
      type: 'PING',
    }));
  };

  reconnect() {
    console.log('PubSub connection closed By Twitch ', Date.now());
    this.connection.close();
    setTimeout(_ => new PjsTwitchRewards({
      channel: this.channel,
      token: this.token,
      editorMode: false,
    }).connect().catch(), 2500);
  };

  message({
    data: psObject,
  }) {
    psObject = JSON.parse(psObject);
    if (psObject.error) {
      console.log('Error: ', psObject.error);
      //[] handle error
      //this.connection.close(); //do nothing? force websocket close? force reconnect with expoential delay? :shrug:
      return;
    } else if (psObject.type === 'RESPONSE') return;
    else if (psObject.type === 'PONG') return;
    else if (psObject.type === 'RECONNECT') return this.reconnect();
    else if (psObject.type === 'MESSAGE' && psObject.data.topic === this.topic) {

      // ??? unsure of Object
      let message = JSON.parse(psObject.data.message);
      console.log('PUBSUB message: ', message);

      if (message.type === 'reward-redeemed') return this.emitPuSub(message); //this should be the one.... i think
    };
  };

  emitPuSub(message) {

    //[] to do: fix this Object
    console.log("emitPuSub()...");

    //format Object below to match 'message' keys; "tags" -> pass on full Object

    //message Object unknown;
    const rewardEvent = new CustomEvent("onEventReceived", {
      detail: {
        "listener": "reward-redeemed", //what SE event is looking for
        "event": {
          "service": "twitch", //always Twitch
          "data": {
            "time": new Date(message.timestamp).getTime(), //format time
            "tags": message, //send full Object; keys below are mapped for ease of use / match existing SE format
            "nick": message.redemption.user.login,
            "userId": message.redemption.user.id,
            "displayName": message.redemption.user.display_name,
            "text": message.redemption.user_input,
            "rewardId": message.redemption.reward.id, //id of the Reward; common between all redems
            "rewardTitle": message.redemption.reward.title,
            "cost": message.redemption.reward.cost,
            "id": message.redemption.id, //id of the the redemtion; this is unquie for this single event
          },
        },
      },
    });
    window.dispatchEvent(rewardEvent);
  };

  getData(endpoint) {
    return new Promise((res, rej) => {
      fetch(endpoint, {
          headers: {
            Authorization: `Bearer ${this.token}`,
            'Client-Id': this.clientId,
          },
        })
        .then(response => response.json())
        .then(data => {
          if (data.status > 299) return rej(`Error: ${data.error}; ${data.message}`); //token check; Token&Scope checked above; this checks that user is affialite/partner and has at least 1 reward.
          else return res(data);
        })
        .catch(e => rej(`PjsTwitchRewards.getData() Error: ${e}`)); //should never see this error, :fingerscrossed:
    });
  };

  showError(error) {
    const pjsTwitchRewardsErrorDiv = document.createElement('div');
    pjsTwitchRewardsErrorDiv.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:25px;background:red;color:white';
    pjsTwitchRewardsErrorDiv.innerText = `PjsTwitchRewards: ${error}`;
    document.body.appendChild(pjsTwitchRewardsErrorDiv);
  };
};
// END HTML <script>






/* SE */

window.addEventListener('onWidgetLoad', obj => {
  const pjsTwitchRewardsSettings = {
    channel: obj.detail.channel.providerId, //userId; set on widget load with obj data
    token: token, //user token; requires user input and scope: 'channel:read:redemptions'
    editorMode: obj.detail.overlay.isEditorMode, //default: true; use 'obj.detail.overlay.isEditorMode'. ***Must pass false to disable***; Adds debouncer to API calls and shows errors in the widget
  };
  //NOTE: PjsTwitchRewards has a built-in 5 second debouncer/delay before resolving.
  new PjsTwitchRewards(pjsTwitchRewardsSettings).connect()
    .then(data => {
      console.log('PjsTwitchRewards Connected; Data: ', data);
      /*
        expect Obj:
        {success: true, rewards: [Array of all channel reward Objects; same as https://dev.twitch.tv/docs/api/reference#get-custom-reward -> data] }
        */
    })
    .catch(e => {
      console.log('PjsTwitchRewards ERROR: ', e);
      /*
        expect Obj:
        {error: true, message: 'error message string'}
        */
    });
});




window.addEventListener('onEventReceived', function(obj) {
  const data = obj.detail.event;

  //listener: reward-redeemed

  console.log('SE Output ', data);
});



//Reference
let exampleData = {
  "type": "reward-redeemed",
  "data": {
    "timestamp": "2019-11-12T01:29:34.98329743Z",
    "redemption": {
      "id": "9203c6f0-51b6-4d1d-a9ae-8eafdb0d6d47",
      "user": {
        "id": "30515034",
        "login": "davethecust",
        "display_name": "davethecust"
      },
      "channel_id": "30515034",
      "redeemed_at": "2019-12-11T18:52:53.128421623Z",
      "reward": {
        "id": "6ef17bb2-e5ae-432e-8b3f-5ac4dd774668",
        "channel_id": "30515034",
        "title": "hit a gleesh walk on stream",
        "prompt": "cleanside's finest \n",
        "cost": 10,
        "is_user_input_required": true,
        "is_sub_only": false,
        "image": {
          "url_1x": "https://static-cdn.jtvnw.net/custom-reward-images/30515034/6ef17bb2-e5ae-432e-8b3f-5ac4dd774668/7bcd9ca8-da17-42c9-800a-2f08832e5d4b/custom-1.png",
          "url_2x": "https://static-cdn.jtvnw.net/custom-reward-images/30515034/6ef17bb2-e5ae-432e-8b3f-5ac4dd774668/7bcd9ca8-da17-42c9-800a-2f08832e5d4b/custom-2.png",
          "url_4x": "https://static-cdn.jtvnw.net/custom-reward-images/30515034/6ef17bb2-e5ae-432e-8b3f-5ac4dd774668/7bcd9ca8-da17-42c9-800a-2f08832e5d4b/custom-4.png"
        },
        "default_image": {
          "url_1x": "https://static-cdn.jtvnw.net/custom-reward-images/default-1.png",
          "url_2x": "https://static-cdn.jtvnw.net/custom-reward-images/default-2.png",
          "url_4x": "https://static-cdn.jtvnw.net/custom-reward-images/default-4.png"
        },
        "background_color": "#00C7AC",
        "is_enabled": true,
        "is_paused": false,
        "is_in_stock": true,
        "max_per_stream": {
          "is_enabled": false,
          "max_per_stream": 0
        },
        "should_redemptions_skip_request_queue": true
      },
      "user_input": "yeooo",
      "status": "FULFILLED"
    }
  }
}
