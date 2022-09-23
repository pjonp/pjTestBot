console.log('LOAD');
const testingMode = true; //FALSE FOR RELEASE!
const disableTwitchBlocking = true;


const Widget = {
  wait: (ms) => new Promise(r => setTimeout(r, ms)),
  verifyBotMsg: () => new Promise(r => jebaitedAPI.checkScope('botMsg').then(r).catch(e => {
    Widget.displayError(`Jebaited Error! botMsg scope is required!: ${e.error ? e.error : e}`, true);
  })),
  say: (msg) => { //say to chat
    console.log('sending message');
    jebaitedAPI.sayMessage(`${msg}`).catch(e => console.log('jebaited.sayMessage: ', e));
  },
  displayError: (e, critical = false) => {
    console.log('MESSAGE:', e, critical);
    if (!e) e = 'Unknown Error';
    if (critical) {
      $('#errorText').append(`<div class='errorText'>${e.error ? e.error : e}.<br>This is a critical error and widget is disabled!</div>`);
      Widget.wait(5000).then(() => $('#container').html(''));
    } else {
      $('#errorText').append(`<div class='errorText'>${e.error ? e.error : e}.<br>This message will auto delete after 10 seconds</div>`);
      Widget.wait(10000).then(() => $('.errorText').first().remove());
    };
  },
};
const banButton = document.getElementById('banButton'),
  blockButton = document.getElementById('blockButton'),
  banDelay = 200, //milliseconds
  blockDelay = 200; //milliseconds

let fieldData, timeoutCorner = {},
  twitchConnected = true, //default to true; then check onLoad
  banAllClicks = 0,
  banAllClicksTimer, blockAllClicks = 0,
  blockAllClicksTimer, blockCount = 0,
  verifyDelay = 5000,
  allowedList, blockedList;


//MASTER regex
const firstRegExFilter = /[^( -~)“”‘’—]/u // First regEx Pass; allow all keyboard keys (US keyboard)  (0.0.1: add Apple 'Smart Punctuation': “”‘’—)!!DONT USE GLOBAL FLAG!!
const secondRegExFilter = /[^( -~)“”‘’—\p{Emoji}]/u // Second regEx pass; allow all keyboard keys (US keyboard) (0.0.1: add Apple 'Smart Punctuation': “”‘’—) and all Emjoi (runs after message mutilation) !!DONT USE GLOBAL FLAG!!


window.addEventListener('onWidgetLoad', obj => {
  fieldData = obj.detail.fieldData;

  if (fieldData.jebaitedAPIToken.length !== 24) { //jebaited verify
    Widget.displayError('A Jebaited Token is Required!', true);
    return;
  } else {
    //create jebaited
    jebaitedAPI = new Jebaited(fieldData['jebaitedAPIToken']);
    //verify botSay scope
    Widget.wait(obj.detail.overlay.isEditorMode ? 2500 : 0)
      .then(Widget.verifyBotMsg()
        .then(() => {
          console.log('Jebaited connection is valid.');

          regExFormatter(); //build regEx
          checkTwitchConnection(); //check Twitch tokens

          //build button listeners
          banButton.addEventListener('click', e => {
            e.preventDefault();
            banAll();
          });
          blockButton.addEventListener('click', e => {
            e.preventDefault();
            blockAll();
          });

          //TESTING
         //ADD FIELD DATA TEST MESSAGES 0-4
          Object.keys(fieldData).filter(i => i.startsWith('testMsg_')).forEach(i => {
            if (!fieldData[i]) return;
            testChats[parseInt(i.replace('testMsg_', ''))].message = fieldData[i];
          });
      	  //trigger test messages if in test mode or in overlay editor
          if (testingMode || obj.detail.overlay.isEditorMode) setTimeout(() => testChat(0), 5000);
          //
        }))
      .catch(e => console.log('ummm... verify error?: ', e));
  };
  return;
});

window.addEventListener('onEventReceived', obj => {
  if (obj.detail.listener !== "message") return; //only care about messages
  const data = obj.detail.event.data;
  if (data.userId === data.tags['room-id'] || parseInt(data.tags.mod) === 1 || data.nick === 'streamelements') return; //streamer, mod and SE check;

  //could function wrap thing [?]
  let msg = data.text; //message sent in chat
  if (firstRegExFilter.test(msg)) { //first filter test.
    //allowedList replace
    msg = msg.replace(allowedList, ''); //remove characters on allowed list
    //blockedList replace
    msg = msg.replace(blockedList, 'ӸϚΘ'); //replace characters on blocked list with bad characters to force positive trigger
    //run second filter (including Emoji) ....
    if (secondRegExFilter.test(msg)) { //check second filter with edited message.
      timeoutCorner[data.userId] = {
        username: data.nick, //LOWERCASE!
        message: obj.detail.event.renderedText || 'null',
        timeStamp: data.tags["tmi-sent-ts"] || 0
      };
      return putInCorner(data.userId);
    };
  };
  return;
});

function regExFormatter() {
  //sanitize user inputs. [x]
  try { //need user allowed input as a string; first check for characters input that fail first filter (ignore ',space,|[{(/\ etc.)
    fieldData.allowedList = fieldData.allowedList.match(new RegExp(firstRegExFilter.source, firstRegExFilter.flags + 'g')).join('');
  } catch { //catch the empty Array.join()
    fieldData.allowedList = '';
  };
  try { //^
    fieldData.blockedList = fieldData.blockedList.match(new RegExp(firstRegExFilter.source, firstRegExFilter.flags + 'g')).join('');
  } catch { //^
    fieldData.blockedList = '';
  };
  // ADD ALLOW FIELD DATA ADDERS
  Object.keys(fieldData).filter(i => i.startsWith('allowPreset_')).forEach(i => fieldData[i] !== 'off' ? fieldData.allowedList += fieldData[i] : '');
  // ADD BLOCK FIELD DATA ADDERS
  Object.keys(fieldData).filter(i => i.startsWith('blockPreset_')).forEach(i => {
    //catch for emoji categories? not sure? :thinking: `\p{RI}` for reginal indicators? [x]
    if (fieldData[i] !== 'off') fieldData.blockedList += fieldData[i];
    fieldData[i] = ''; //memory clean on large emoji groups
  });
  //build regExs; both lists are 'simple' character sets: /[]/gu
  allowedList = new RegExp(`[${fieldData.allowedList}]`, 'gu'); //built allowed list
  blockedList = new RegExp(`[${fieldData.blockedList}]`, 'gu'); //build block list
  return;
};

function checkTwitchConnection() {
  const connectError = (e) => {
    twitchConnected = false;
    blockButton.remove();
    if (e) Widget.displayError(e);
    return;
  };
  /*
  DISABLE TWITCH BLOCKING
  */
  if (disableTwitchBlocking) return connectError();

  //add Twitch token length check. []
  if (!fieldData.twitchAPIclient || !fieldData.twitchAPIOAuth) {
    connectError('Twitch API Info Missing!');
  } else {
    blockUser('529564237').then(d => { //random test target from known list.
      if (d.status === 204) {
        Widget.displayError(`Twitch API Connected!`);
      } else {
        connectError(`Twitch API Could Not Connect: ${d.message}`)
      };
    }).catch(e => {
      connectError(`Twitch API Error: ${e}`);
    });
  };
  return;
};

function putInCorner(key) { //key === userID; rename var to match []
  const target = timeoutCorner[key]; //key === userID
  /*
  EXAMPLE USER OBJECT:
  USERID: {
    username: data.nick,  //LOWERCASE!
    message: obj.detail.event.renderedText,
    timeStamp: data.tags["tmi-sent-ts"]
  };
  */

  //Zaytri MAGIC HERE

  //************************
  //HTML STRING
  let HTMLString = `<div class='msg' style='display:none' id=${key}><button id="fixButton_${key}"> ✔️ </button><span class='msgUser'>${target.username}</span></div>`;
  //HTML STRING
  //************************
  try {
    $(`#${key}`).remove();
  } catch {
    //meh
  };
  let msgContainer = $('#msgContainer');
  msgContainer.children().first().removeClass("blink popInLeft"); //reset animations
  msgContainer.prepend(HTMLString); //add new message
  msgContainer.children().first().fadeIn().addClass("blink popInLeft"); //fade in animation

  //Zaytri END MAGIC HERE

  document.getElementById(`fixButton_${key}`).addEventListener('click', e => {
    e.preventDefault();
    timeoutUser(timeoutCorner[key].username, 1);
    delete timeoutCorner[key];
    try {
      $(`#${key}`).remove();
    } catch {
      //meh
    };
  });
  return;
};

//add button and force double click [x]
async function banAll() {

  blockButton.setAttribute("disabled", "disabled");
  blockButton.style.visibility = "hidden";

  if (banAllClicks === 0) {
    banButton.innerText = `Are you sure?`;
    banAllClicksTimer = setTimeout(() => {
      banAllClicks = 0
      banButton.innerText = `BAN ALL`;
      blockButton.removeAttribute("disabled");
      blockButton.style.visibility = "visible";
      return;
    }, verifyDelay);
    banAllClicks++;
    return;
  };
  clearTimeout(banAllClicksTimer);
  banButton.setAttribute("disabled", "disabled");
  banAllClicks = 0;
  const timeoutCornerIDs = Object.keys(timeoutCorner);
  console.log('timeoutCornerIDs ', timeoutCornerIDs);
  banButton.innerText = `Banning ${timeoutCornerIDs.length} users`;

  timeoutCornerIDs.forEach(async (i, index) => {
    setTimeout(() => {
      banUser(timeoutCorner[i].username);
      $(`#${i}`).remove();
      delete timeoutCorner[i];
    }, index * banDelay);
  });
  await Widget.wait((timeoutCornerIDs.length + 1) * banDelay);
  banButton.innerText = `${timeoutCornerIDs.length} Users Have Been Banned`;
  banButton.innerText = 'BAN ALL'
  banButton.removeAttribute("disabled");
  blockButton.removeAttribute("disabled");
  blockButton.style.visibility = "visible";
  console.log(`${timeoutCornerIDs.length} Users Have Been Banned`);
};


async function blockAll() {
  if (!twitchConnected) return Widget.displayError('Twitch API Connection Required!');

  banButton.setAttribute("disabled", "disabled");
  banButton.style.visibility = "hidden";

  if (blockAllClicks === 0) {
    blockButton.innerText = `Are you sure?`;
    blockAllClicksTimer = setTimeout(() => {
      blockAllClicks = 0
      blockButton.innerText = `BLOCK ALL`;
      banButton.removeAttribute("disabled");
      banButton.style.visibility = "visible";
      return;
    }, verifyDelay);
    blockAllClicks++;
    return;
  };
  clearTimeout(blockAllClicksTimer);
  blockButton.setAttribute("disabled", "disabled");
  blockAllClicks = 0;
  const timeoutCornerIDs = Object.keys(timeoutCorner);
  blockButton.innerText = `BLOCKING ${timeoutCornerIDs.length} users`;

  timeoutCornerIDs.forEach(async (i, index) => {
    setTimeout(() => {
      blockUser(timeoutCorner[i].username).then((res) => {
        if (res.status === 204) {
          $(`#${i}`).remove();
          delete timeoutCorner[i];
          blockCount++;
        };
      }).catch(e => console.log('BLOCK USER ERROR: ', e));
    }, index * blockDelay);
  });
  await Widget.wait((timeoutCornerIDs.length + 1) * blockDelay);
  blockButton.innerText = `${blockCount}/${timeoutCornerIDs.length} Users BLOCKED`;
  blockButton.innerText = 'BLOCK ALL'
  blockButton.removeAttribute("disabled");
  banButton.removeAttribute("disabled");
  banButton.style.visibility = "visible";
  console.log(`${blockCount}/${timeoutCornerIDs.length} Users Have Been BLOCKED`);
  blockCount = 0;
};

//Wrap below into a 'Mod' handler: Mod.Twtich.() []
function timeoutUser(user, time = fieldData.timeoutLength) {
  console.log(`/timeout ${user} ${time} flagged by advancedRegEx Dock`); //redundant; should log in say();
  Widget.say(`/timeout ${user} ${time} flagged by advancedRegEx Dock`);
};

function banUser(user) {
  console.log(`/ban ${user} banned by advancedRegEx Dock`); //redundant; should log in say();
  Widget.say(`/ban ${user} banned by advancedRegEx Dock`);
};

function blockUser(userID) {
  console.log('BLOCKING USER');
  return new Promise((resolve, reject) => {
    if (!twitchConnected) reject('Twitch API not enabled.');
    fetch(`https://api.twitch.tv/helix/users/blocks?target_user_id=${userID}&reason=harassment`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${fieldData.twitchAPIOAuth}`,
          'Client-ID': fieldData.twitchAPIclient
        },
      })
      .then(response => {
        if (response.status === 204) {
          return {
            status: 204,
            message: 'Request Received'
          }
        } else return response.json();
      })
      .then(data => {
        resolve(data);
      })
      .catch(e => {
        console.error(`!!!TWITCH API Error: Blocking user `, e)
        reject();
      });
  });
};



//******************************************
//fake chat

//!! NOTE: THIS FAKE CHAT IS NOT SENDING CORRECT OR ALL INFO !!
//if using for a reference, update eventData Object to match your needs
//******************************************
function testChat(msgId) {

  let userObj = {}, finalMsg = false;
  //final message set for USERNAME only example
  if(msgId > testChats.length) {
    userObj = testChats[0];
    finalMsg = true;
  } else userObj = testChats[msgId];

  let badges = userObj.badges.map(i => {
    return {
      url: badgeUrls[i]
    }
  });
  if (!testChattersColor[userObj.username]) testChattersColor[userObj.username] = `#${Math.floor(Math.random()*16777215).toString(16)}`; //build object for random colors of test chatters

  let eventData = {
    detail: {
      "listener": "message",
      "event": {
        "data": {
          "userId": msgId,
          "badges": badges || [''],
          "text": !finalMsg ? userObj.message : "ӸϚΘ",
          "displayName": userObj.username,
          "displayColor": testChattersColor[userObj.username],
          "nick": !finalMsg? `TEST ${msgId + 1} : ${userObj.message}` : "LIVE_USERNAME_EXAMPLE", //userObj.username.toLowerCase(), //OVERRIDE FOR TEST MESSAGES
          "emotes": [],
          "tags": {
            "room-id": '1413',
            "mod": '0',
          },
        }
      },
      "tags": {
        "tmi-sent-ts": Date.now(),
      },
    },
  };
  let event = new CustomEvent('onEventReceived', eventData);
  window.dispatchEvent(event);
  msgId++;
  //ADD FINAL MESSAGE FOR RELEASE
  if (msgId === testChats.length) setTimeout(() => testChat(999), userObj.nextMsg);
  if (msgId >= testChats.length) return //msgId = 0; //remove loop; use for limit testing ;)
  setTimeout(() => testChat(msgId), userObj.nextMsg); //call next chat
};

const badgeUrls = {
  broadcaster: "https://static-cdn.jtvnw.net/badges/v1/5527c58c-fb7d-422d-b71b-f309dcb85cc1/3",
  moderator: "https://static-cdn.jtvnw.net/badges/v1/3267646d-33f0-4b17-b3df-f923a41db1d0/3",
  //vip?
  //others?
  partner: "https://static-cdn.jtvnw.net/badges/v1/d12a2e27-16f6-41d0-ab77-b780518f00a3/3"
};

let msgTestMS = 1000, //ms; use for limit testing ;)
  testChats = [{
      username: 'chatter1',
      badges: [],
      message: "What Is Crème Fraiche?",
      nextMsg: msgTestMS
    },
    {
      username: 'chatter2',
      badges: [],
      message: "Tú tienes un perro muy bonito.",
      nextMsg: msgTestMS
    },
    {
      username: 'chatter3',
      badges: [],
      message: "😀",
      nextMsg: msgTestMS
    },
    {
      username: 'chatter4',
      badges: ['broadcaster'],
      message: "🙈",
      nextMsg: msgTestMS
    },
    {
      username: 'chatter5',
      badges: [],
      message: "🙉",
      nextMsg: msgTestMS
    },
  ];
let testChattersColor = {}; //random color for test message users
