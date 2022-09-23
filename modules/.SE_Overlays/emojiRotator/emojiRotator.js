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
let eventTriggers = {}; //Object of reward Objects

window.addEventListener('onWidgetLoad', obj => { //on the widget load
  widget.isEditorMode = obj.detail.overlay.isEditorMode;
  if (widget.isEditorMode) { //check if in overlay editor
    document.getElementById('info').style.display = 'block'; //show the status bar
  };

  buildEmojiRotator(obj.detail).then(status => {
      const msg = 'Connected; Test a reward on your Twitch channel'; //Status message in info bar
      new TwitchPubSub(obj.detail.channel.providerId).connect().then(_ => document.getElementById('status').innerText = msg); //replace 'connecting' with msg once connected ~10 seconds;
      widget.info(status, false);
    })
    .catch(e => {
      widget.info(e, true, true)
      document.getElementById('status').innerText = `Canceled: ${e}`;
    }); //emojiRotator Module
});

window.addEventListener('onEventReceived', obj => { //on event
  const event = obj.detail.event, //variables for event & listener
    listener = obj.detail.listener;
  if (listener === 'reward-redeemed') { //custom listener from imported code
    console.log('SE Event Output ', event); //Console event for Object reference

    document.getElementById('testReward').innerText = event.data.rewardTitle; //update info bar header with last channel point
    if (eventTriggers[event.data.rewardTitle]) eventTriggers[event.data.rewardTitle].run(event.data); //if the reward title one we want, run the overlay code;

  } else if (event.listener === 'widget-button') { //test buttons
    Object.keys(eventTriggers) //convert main object to Array
      .filter(i => eventTriggers[i].testButton === event.field) //filter the Array to get the correct reward. eventTrigger button is an "index" value; pass on...
      .forEach(i => eventTriggers[i].run()); //play the event that matches the button clicked. Dupliates are handled onLoad, so only 1 event will exist
  };
});

//Widget module for queue system and show/hide
const widget = { //main widget "module" code
  isEditorMode: true, //true if in overlay editor; set in the onWidgetLoad event
  container: document.getElementById('main'), //set container for the widget
  timer: null, //main widget timer; used for queue
  queue: [], //queue for the widget, array of event Objects
  //[ [event1, data1] , [event2,data2] ... ]
  checkQueue: () => { //queue check
    if (widget.queue.length > 0 && !widget.timer) { //if the there is an item in the queue and timer is NOT running
      widget.show(); //show widget; redunant if already shown :shrug:
      let target = widget.queue[0][0] //get the module Object of the 1st item in the queue
      target.run(widget.queue[0][1], false); //run the queued item; send 'false' as it's not a new event. see notes on emojiRotator Object
      widget.timer = setTimeout(_ => { //set a timer for the event
        target.end() //call the end function of the event
          .then(() => { //end function is a promise for future expansion
            clearTimeout(widget.timer); //clear the timer
            widget.timer = null; //set to null. don't want to save state, want to clear for queue check
            widget.queue.shift(); //remove the event that just played from the queue
            widget.checkQueue(); //check if the queue again
          })
      }, target.duration); //user set length for overlay event duration
    } else if (widget.queue.length === 0) { //if the queue is empty
      widget.hide(); //hide the widget
    };
  },
  wait: (ms) => new Promise(r => setTimeout(r, ms)),
  show: _ => { //CSS toggle to show the widget
    widget.container.classList.remove('hide') //remove hide class
    widget.container.classList.add('show'); //add show class
  },
  hide: _ => { //CSS toggle to hide the widget
    widget.container.classList.remove('show'); //remove show class
    widget.container.classList.add('hide'); //add hide class
  },
  info: (msg, warn = false, critical = false) => { //funciton to add items to the info panel
    console.log(msg); //log the msg and error if there is one in the console
    msg = msg.error ? msg.error : msg;
    let infoContainer = document.getElementById('info'), //get info container
      newMsg = document.createElement('li'); //create a new list item node
    newMsg.innerText = msg; //set the text of the list item
    if (warn) {
      newMsg.style.color = 'red'; //set text color to red if it's a warning
      newMsg.style.fontWeight = 'bold';
    };
    infoContainer.appendChild(newMsg); //add the message to the list
    if (!critical) setTimeout(_ => newMsg.remove(), 5000); //remove the message after 5 seconds if not critical
  },
  loadJebaited: (token) => { //load jebaited
    setTimeout(() => { //timer to limit API calls on all "state" changes
      if (widget.jebaited) return; //prevent multiple instances.
      widget.jebaited = new Jebaited(token); //lx's class
      widget.jebaited.getAvailableScopes() //get scopes on load
        .then(d => widget.info(`Jebaited Loaded with scopes: ${widget.jebaited.tokenScopes}`)) //message load is successful and list scopes
        .catch(e => widget.info(`Jebaited Error: ${e.error ? e.error : e}`, true, true)); //message error
    }, widget.isEditorMode ? 2500 : 0); //2.5 second delay when in editor mode
  },
  jebaited: null, //created when loaded
  say: (msg) => {
    if (!widget.jebaited) return widget.info('Jebaited not loaded');
    else if (!widget.jebaited.tokenScopes) return widget.info('Error: no Jebaited Scopes', true);
    widget.jebaited.sayMessage(msg).catch(e => widget.info(e, true));
  }
};

//emojiRotator Module loader. Build the event triggers
function buildEmojiRotator(detail, i = 0) { //emojiRotator module builder, called on widgetload
  return new Promise((res, rej) => { //return promise; verify that user added at least 1 reward;
    const verifyRewards = () => { //function to check amount of rewards
      const amountLoaded = Object.keys(eventTriggers).length;
      if (amountLoaded > 0) res(`${amountLoaded} Emoji Rotator Rewards Loaded`); //if 1 or more reward, resolve
      else rej('No Rewards Are Filled In'); //if no rewards then reject and prevent websocket connection
    }

    formatFieldData(detail); //call function below

    function formatFieldData(detail, i = 0) { //function to loop and build master Object
      i++; //reward and loop counter
      if (i > 11) return verifyRewards(); //get reward info; field data locked to 5 only, but headroom for users that try to sneek in more
      const fieldData = detail.fieldData; //field data passed from widgetLoad
      const rewardText = fieldData[`reward${i}_rewardText`];

      if (!rewardText) return formatFieldData(detail, i) //skip empty segments
      else if (eventTriggers[rewardText]) { //check if a duplicate
        widget.info(`${rewardText} is a duplicate, reward #${i} skipped`, true); //send message to info panel
        return formatFieldData(detail, i); //skip duplicates
      };

      const rewardObject = { //build Object that 'emojiRotator' is looking for
        index: i,
        name: rewardText, //reward name
        inputString: fieldData[`reward${i}_emojis`] || '', //get user input, set to empty if nothing. Error handling done in emojiRotator.verify()
        duration: fieldData[`reward${i}_duration`],
        speed: fieldData[`reward${i}_speed`],
        audio: fieldData[`reward${i}_audio`],
        audioDelay: fieldData[`reward${i}_audioDelay`],
        volume: fieldData[`reward${i}_audioVolume`],
        chatMsg: fieldData[`reward${i}_chatMsg`],
        chatMsgDelay: fieldData[`reward${i}_chatMsgDelay`],
      };
      const reward = new emojiRotator(rewardObject); //build new "reward"
      reward.verify().then(() => { //verify the reward has valid inputs; see emojiRotator.verify();
          eventTriggers[rewardText] = reward; //if it is ok; then add the reward Object to eventTriggers with the Key name of the reward text
          widget.info(`${rewardText} Added`, false); //send success message to be put into info panel
          if (rewardObject.chatMsg) widget.loadJebaited(fieldData[`jebaitedAPIToken`]); //if there is a msg input from the user, then load Jebaited. Instance handling done in loadJebaited()
          if (widget.isEditorMode && fieldData[`reward${i}_showOnLoad`]) eventTriggers[rewardText].run(); //show example on load/change if setting enabled
        }).catch(e => widget.info(`Could not load reward: ${rewardText}: ${e}`, true, true)) //catch and log reward error. [x] maybe: add visual for this?
        .finally(_ => formatFieldData(detail, i)); //loop
    };
  });
};

//emojiRotator Module class.
class emojiRotator { //"emojiRotator" object class, to build different variations of the alert. These are created on the widgetLoad
  constructor(reward) { //build the class with the reward Object, from widgetLoad to pass on the field data
    this.index = reward.index;
    this.reward = reward.name; //name of the Twitch channel points
    this.testButton = `reward${this.index}_testButton`;
    this.inputString = reward.inputString; //user text input
    this.emojis = reward.inputString.match(/\p{Emoji}/gu); //this module only wants Emoji, so regrex filter for an Array of only Emoji
    this.duration = reward.duration * 1000; //field data duration for this reward
    this.speed = reward.speed * 1000; //field data speed for this reward
    this.audio = (_ => reward.audio ? new Audio(reward.audio) : null)(); //field data audio for this reward; self called function, create Audio if exists or set to null
    this.audioDelay = reward.audioDelay * 1000; //field data audio delay for this reward
    this.volume = (_ => this.audio ? this.audio.volume = reward.volume / 100 : null)(); //field data volume for this reward; self called function, check if Audio exists then set or ignore
    this.chatMsg = reward.chatMsg; //field data for chat response message
    this.chatMsgDelay = reward.chatMsgDelay * 1000; //field data for chat delay, used to sync chat with stream delay
    this.progess = 0; //progress for this event, index of 'emojis' Array, to pick up from last position
    this.timer = null; //timer for this reward, timer used to control the speed between emojis
  };
  verify() { //verify function for this instance
    return new Promise((res, rej) => { //Promise for future use
      if (this.duration < this.audioDelay) rej(`Audio delay exceeds the total duration!`) //check if the audio delay is longer than the alert itself
      if (this.speed < 175) this.speed = this.duration / this.emojis.length; //if 0; auto set duration to equal ammount for each
      if (this.emojis) res(); //check if user acutally has Emoji in the input or the Array (emojis) is null
      else rej(`There are no emojis in string: ${this.inputString}`); //reject if there is nothing to display. handled in widgetLoad
    });
  }
  run(data, add = true) { //main function, data, not used, but if you are reading this, it's where the username is passed ;), add = true for new event, queue will call false to bypass
    if (add) { //new event flagged as true and requires a queue check. A false will be sent from the queue to bypass this
      widget.queue.push([this, data]); //add new event to the queue; passes the full reward Object (this)
      return widget.checkQueue(); //queue will check if already running, and call this function when it's up in queue with run (false) to bypass this check
    };
    if (!data) data = { //fake data for testing
      displayName: 'pjonp' //that's me
    };

    //!!!!!!!!!!!!!!!!!!!!!!!!!!
    //if you want to edit something in this Widget then this is probably where you want to edit ;)
    //!!!!!!!!!!!!!!!!!!!!!!!!!!


    const rotateEmoji = () => { //rotator for this module
      if (this.progess === this.emojis.length) this.progess = 0; //cycle through the emojis Array, restart at 0 when at the end
      widget.container.innerText = this.emojis[this.progess]; //put the emoji into the DOM
      this.progess++; //add 1 to the index for next emoji
      this.timer = setTimeout(_ => rotateEmoji(this.progess), this.speed); //wait for the user setting amount of time, then restart this function with the next item (loop)
    };
    rotateEmoji(); //start the emoji loop


    //!!!!!!!!!!!!!!!!!!!!!!!!!!
    //end edit
    //!!!!!!!!!!!!!!!!!!!!!!!!!!

    if (this.audio) { //check if the user set an audio
      setTimeout(_ => { // audio delay timer
        this.audio.play(); //play the audio
      }, this.audioDelay); //wait to play the audio after user set time
    };
    if (this.chatMsg) { //check if the user set a chat message
      setTimeout(_ => { // message delay timer
        const msg = this.chatMsg.replace(/{reward}/gi, this.reward).replace(/{user}/gi, data.displayName);
        widget.say(msg);
      }, this.chatMsgDelay); //wait to send message
    };
  };
  end() { //end function, called from Widget at end of the alert
    return new Promise((res, rej) => { //Promise for future use
      clearTimeout(this.timer); //clear the timer that is rotating the Emojis in rotateEmoji()
      this.timer = null; //set timer to null
      if (this.audio) { //redundant audio check; could check if next event is the same a keep same audio going :thinking: [] maybe
        this.audio.pause(); //pause the audio if playing
        this.audio.currentTime = 0; //reset the audio for next event
      };
      this.progess = 0 //reset progress when done. [] maybe; user option to select restart or continue
      res(); //respond after end function is done
    });
  };
};
