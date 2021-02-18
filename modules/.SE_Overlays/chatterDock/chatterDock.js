/*
New Chatter Dock 1.0 by pjonp

Made pretty by JayniusGamingTV

The MIT License (MIT)
Copyright (c) 2021 pjonp
*/

const testChannel = 'dunkstream';

let chatters = {}; //master chatter object; LOWERCASE usernames as keys
/*
{
  username1: {displayName: 'USERname1', time: 2349, message: 'message', level: 'mod'},
  user2: {displayName: 'User2', time: 3294, message: 'sdiojsfd', level: 'other'}
}
*/
let settings = { //master settings object
  totalCount: 0,
  lineCount: 0,
  maxLines: 10,
  getLevel: (a) => a.tags.badges.indexOf("vip") !== -1 ? 'vip' : a.tags.mod === '1' ? 'mod' : a.tags.subscriber === '1' ? 'sub' : 'other', //in order -> VIP > MOD > SUB > OTHER (chatter only gets 1 tag)
  vip: {enabled: true, count: 0},
  mod: {enabled: true, count: 0},
  sub: {enabled: true, count: 0},
  other: {enabled: true, count: 0}
}

window.addEventListener('onWidgetLoad', obj => {
  fieldData = obj.detail.fieldData;
  //Get field data... TBD
  let ignoredChatters = fieldData.ignoredChattersFD.replace(/ /g, '').split(',') || []; //get ignored list and build array from input
  settings.vip.enabled = fieldData.FDenableVip === 'yes';
  settings.mod.enabled = fieldData.FDenableMod === 'yes';
  settings.sub.enabled = fieldData.FDenableSub === 'yes';
  settings.other.enabled = fieldData.FDenableOther === 'yes';
  settings.maxLines = fieldData.FDmaxLines;
  ignoredChatters.forEach(i => chatters[i.toLowerCase()] = {displayName: i, time: 0, message: 'ignored chatter', level: 'other'}); //add place holders for each ignored user (forced to lowercase)

  testWithTMI(); //testing
});

window.addEventListener('onEventReceived', obj => {
  if (obj.detail.listener !== "message") return;
    let data = obj.detail.event.data;
  if(!chatters[data.nick]) { //check if user is already in the master list (already chatted) based on "nick" (lowercase username).
      let level = settings.getLevel(data); //get/save level
      chatters[data.nick] = { //build chatter object
        displayName: data.displayName, //display name to show later (keys forced to lowercase for user input)
        time: data.time, //time of message; not used but could track (not chatted this stream for X amount of time or !lurk)
        message: obj.detail.event.renderedText, //message sent to chat (data.text)
        level: level //vip/sub/mod
      };
      updateDisplay(data.nick); //send the "key" to update
      return;
    } else return;
});
const updateDisplay = (username) => { //update based on username "key"
  let chatData = chatters[username]; //get Chatter object
  settings.totalCount++; //add 1 to the total count
  settings[chatData.level].count++; //add 1 to the sub-stat (mod/vip/sub)
  $(`#totalChatters`).text(settings.totalCount); //update total HTML
  $(`#${chatData.level}Chatters`).text(settings[chatData.level].count); //update sub-stat HTML
  if(settings[chatData.level].enabled) { //if display this type (vip/mod)

//************************
//HTML STRING
    let HTMLString = `<div class='msg' style='display:none'><span class='msgUser ${chatData.level}'>${chatData.displayName}</span><br><div class='msgUserChat'>${chatData.message}</div></div>`;
//HTML STRING
//************************
    let msgContainer = $('#msgContainer');
    msgContainer.children().first().removeClass("blink popInLeft"); //reset animations
    msgContainer.prepend(HTMLString); //add new message
    msgContainer.children().first().fadeIn().addClass("blink popInLeft"); //fade in animation
    settings.lineCount++;
    if(settings.lineCount > settings.maxLines) msgContainer.children().last().remove(); //clear up old containers
    return;
  } else return;
};

//TESTING WITH TMI
function testWithTMI() {
 let clientOptions = {
            connection: {
                reconnect: true,
                secure: true,
            },
            channels: [testChannel]
        };
        const client = new TwitchJS.client(clientOptions);
        client.on('message', function (channel, userstate, message) {
            channel=channel.replace("#","");
            let emotes = [], badges = ['none'] //[{"type": "ExternalChannel", url: channels[channel].avatar}];
          	if(!userstate.badges) userstate.badges = {none: '1'};
                    let eventData = {
                detail: {
                    "listener": "message",
                    "event": {
                        "data": {
                            "channel": channel,
                            "emotes": emotes,
                            "badges": userstate.badges,
                            "text": message,
                            "displayName": userstate['display-name'],
                            "displayColor": userstate['color'] ? userstate['color'] : "",
                            "msgId": userstate['id'],
                            "userId": userstate['user-id'],
                            "nick": userstate['username'],
                            "tags": {
                             "badges": userstate.badges['vip'] ? "vip" : "empty",
                             "mod": userstate.badges['moderator'] ? "1" : "0",
                             "subscriber": userstate.badges['subscriber'] ? "1" : "0"
                            }
                        }
                    }
                }
            };
            // Dispatching message event with same structure as native StreamElements
            let event = new CustomEvent('onEventReceived', eventData);
            window.dispatchEvent(event);
        });
        client.connect();
};
