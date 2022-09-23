const anonChatters = '{{FDanonNames}}' === 'yes';

let totalMessages = 0,
  messagesLimit = 0,
  nickColor = "user";
let animationIn = 'bounceIn';
let animationOut = 'bounceOut';
let hideAfter = 60;
let hideCommands = "no";
let ignoredUsers = [];
let globalCooldown = 0; //seconds
let provider = "twitch";
let queue = [];
let isPlaying = false;
let userConfig = [{
    emote: "!{{eventtrigger1}}",
    amount: 1,
    videoFile: "{{eventvideo1}}",
    soundFile: "",
    imageFile: "",
    volume: 50,
    timeout: 10, //seconds for triggering combo (amount occurrences within timeout seconds)
    cooldown: 1, //seconds
    caseSensitive: false,
  },
  {
    emote: "!{{eventtrigger2}}",
    amount: 1,
    videoFile: "{{eventvideo2}}",
    soundFile: "",
    imageFile: "",
    volume: 50,
    timeout: 10, //seconds for triggering combo (amount occurrences within timeout seconds)
    cooldown: 1, //seconds
    caseSensitive: false,
  },
  {
    emote: "!{{eventtrigger3}}",
    amount: 1,
    videoFile: "{{eventvideo3}}",
    soundFile: "",
    imageFile: "",
    volume: 50,
    timeout: 10, //seconds for triggering combo (amount occurrences within timeout seconds)
    cooldown: 1, //seconds
    caseSensitive: false,
  },
  {
    emote: "!{{eventtrigger4}}",
    amount: 1,
    videoFile: "{{eventvideo4}}",
    soundFile: "",
    imageFile: "",
    volume: 50,
    timeout: 10, //seconds for triggering combo (amount occurrences within timeout seconds)
    cooldown: 1, //seconds
    caseSensitive: false,
  },
  {
    emote: "!{{eventtrigger5}}",
    amount: 1,
    videoFile: "{{eventvideo5}}",
    soundFile: "",
    imageFile: "",
    volume: 50,
    timeout: 10, //seconds for triggering combo (amount occurrences within timeout seconds)
    cooldown: 1, //seconds
    caseSensitive: false,
  },
  {
    emote: "!{{eventtrigger6}}",
    amount: 1,
    videoFile: "{{eventvideo6}}",
    soundFile: "",
    imageFile: "",
    volume: 50,
    timeout: 10, //seconds for triggering combo (amount occurrences within timeout seconds)
    cooldown: 1, //seconds
    caseSensitive: false,
  },
  {
    emote: "!{{eventtrigger7}}",
    amount: 1,
    videoFile: "{{eventvideo7}}",
    soundFile: "",
    imageFile: "",
    volume: 50,
    timeout: 10, //seconds for triggering combo (amount occurrences within timeout seconds)
    cooldown: 1, //seconds
    caseSensitive: false,
  },
  {
    emote: "!{{eventtrigger8}}",
    amount: 1,
    videoFile: "{{eventvideo8}}",
    soundFile: "",
    imageFile: "",
    volume: 50,
    timeout: 10, //seconds for triggering combo (amount occurrences within timeout seconds)
    cooldown: 1, //seconds
    caseSensitive: false,
  },
  {
    emote: "!{{eventtrigger9}}",
    amount: 1,
    videoFile: "{{eventvideo9}}",
    soundFile: "",
    imageFile: "",
    volume: 50,
    timeout: 10, //seconds for triggering combo (amount occurrences within timeout seconds)
    cooldown: 1, //seconds
    caseSensitive: false,
  },
  {
    emote: "!{{eventtrigger10}}",
    amount: 1,
    videoFile: "{{eventvideo10}}",
    soundFile: "",
    imageFile: "",
    volume: 50,
    timeout: 10, //seconds for triggering combo (amount occurrences within timeout seconds)
    cooldown: 1, //seconds
    caseSensitive: false,
  },
  {
    emote: "!{{eventtrigger11}}",
    amount: 1,
    videoFile: "{{eventvideo11}}",
    soundFile: "",
    imageFile: "",
    volume: 50,
    timeout: 10, //seconds for triggering combo (amount occurrences within timeout seconds)
    cooldown: 1, //seconds
    caseSensitive: false,
  },
  {
    emote: "!{{eventtrigger12}}",
    amount: 1,
    videoFile: "{{eventvideo12}}",
    soundFile: "",
    imageFile: "",
    volume: 50,
    timeout: 10, //seconds for triggering combo (amount occurrences within timeout seconds)
    cooldown: 1, //seconds
    caseSensitive: false,
  },
  {
    emote: "!{{eventtrigger13}}",
    amount: 1,
    videoFile: "{{eventvideo13}}",
    soundFile: "",
    imageFile: "",
    volume: 50,
    timeout: 10, //seconds for triggering combo (amount occurrences within timeout seconds)
    cooldown: 1, //seconds
    caseSensitive: false,
  },
  {
    emote: "!{{eventtrigger14}}",
    amount: 1,
    videoFile: "{{eventvideo14}}",
    soundFile: "",
    imageFile: "",
    volume: 50,
    timeout: 10, //seconds for triggering combo (amount occurrences within timeout seconds)
    cooldown: 1, //seconds
    caseSensitive: false,
  },
  {
    emote: "!{{eventtrigger15}}",
    amount: 1,
    videoFile: "{{eventvideo15}}",
    soundFile: "",
    imageFile: "",
    volume: 50,
    timeout: 10, //seconds for triggering combo (amount occurrences within timeout seconds)
    cooldown: 1, //seconds
    caseSensitive: false,
  },
];
const parseQueue = () => {
  if (isPlaying) return;
  if (!queue.length) return;
  isPlaying = true;
  console.log("Playing new user");
  const data = queue.shift();
  videoQueue(data);
}

let emoticons = [];

window.addEventListener('onEventReceived', function(obj) {
  if (obj.detail.listener === "delete-message") {
    const msgId = obj.detail.event.msgId;
    $(`.message-row[data-msgid=${msgId}]`).remove();
  } else if (obj.detail.listener === "delete-messages") {
    const sender = obj.detail.event.userId;
    $(`.message-row[data-sender=${sender}]`).remove();
  }
  if (obj.detail.listener !== "message") return;
  let data = obj.detail.event.data;
  if (ignoredUsers.indexOf(data.nick) !== -1) return;
  let message = attachEmotes(data);
  let badges = "",
    badge;
  if (provider === 'mixer') {
    data.badges.push({
      url: data.avatar
    });
  }
  for (let i = 0; i < data.badges.length; i++) {
    badge = data.badges[i];
    badges += `<img alt="" src="${badge.url}" class="badge"> `;
  }
  let username = data.displayName;
  const color = data.displayColor;
  let words = message.split(" ");
  let results = words.filter(value => -1 !== emoticons.indexOf(value.toLowerCase()));
  //console.log(results);

  results = Array.from(new Set(results)); //getting unique words
  for (let i in results) {
    index = userConfig.findIndex(x => x.emote.toLowerCase() === results[i].toLowerCase());
    if (index !== -1) {
      if (!userConfig[index]['caseSensitive'] || userConfig[index]['emote'] === results[i])
        checkPlay(index);
    }
  }
  if (data.text.startsWith("!") && hideCommands === "yes") return;
  addEvent(username, badges, message, data.isAction, color);
});
let cooldown = 0;

function checkPlay(index) {
  let sound = userConfig[index];
  let video = userConfig[index];

  if (sound.cooldownEnd < Date.now() / 1000) {
    if (video.cooldownEnd < Date.now() / 1000) {
      userConfig[index]['counter']++;
      if (userConfig[index]['timer'] === 0) {
        userConfig[index]['timer'] = userConfig[index]['timeout'];
      }
      if (cooldown > 0) return;
      if (userConfig[index]['counter'] >= userConfig[index]['amount']) {
        userConfig[index]['cooldownEnd'] = (Date.now() / 1000) + sound.cooldown;
        userConfig[index]['cooldownEnd'] = (Date.now() / 1000) + video.cooldown;
        let tmpaudio = new Audio(sound.soundFile + video.videoFile);

        tmpaudio.onloadeddata = function() {
          let videoFile = video.videoFile;
          let videoduration = tmpaudio.duration;

          queue.push({
            videoduration,
            videoFile
          });
          parseQueue();

          cooldown = 0;
        }
      }
    }
  }
}

function videoQueue(data) {
  playVideo(data);
  result = true;
  setTimeout(() => {
    isPlaying = false;
    parseQueue();
  }, data.videoduration * 1000)
}

function playVideo(data) {
  var vid = document.getElementById("vid");
  console.log(data);
  vid.src = data.videoFile
  vid.volume = 10 * .01;
  vid.play();
  $("#vid").fadeIn("slow");
  $('#vid').on('ended', function() {
    $("#vid").hide();
  });
  return vid.duration;
}
for (let key in userConfig) {
  emoticons.push(userConfig[key]["emote"].toLowerCase());
  userConfig[key]['counter'] = 0;
  userConfig[key]['cooldownEnd'] = 0;
  userConfig[key]['timer'] = 0;
}

let t = setInterval(function() {
  cooldown--;
  for (let key in userConfig) {
    userConfig[key]['timer'] = Math.max((userConfig[key]['timer'] - 1), 0);
    if (userConfig[key]['timer'] === 0) {
      userConfig[key]['counter'] = 0;
    }
  }
}, 1000);
window.addEventListener('onWidgetLoad', function(obj) {
  fetch('https://api.streamelements.com/kappa/v2/channels/' + obj.detail.channel.id + '/').then(response => response.json()).then((profile) => {
    provider = profile.provider;
  });
  loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/2.1.1/TweenMax.min.js').then(function() {});
  const fieldData = obj.detail.fieldData;
  animationIn = fieldData.animationIn;
  animationOut = fieldData.animationOut;
  hideAfter = fieldData.hideAfter;
  messagesLimit = fieldData.messagesLimit;
  nickColor = fieldData.nickColor;
  hideCommands = fieldData.hideCommands;
  ignoredUsers = fieldData.ignoredUsers.toLowerCase().replace(" ", "").split(",");







//******************************************
  //move to button??

  if(obj.detail.overlay.isEditorMode) setTimeout( () => testChat(0), 10000);


//******************************************


});

function attachEmotes(message) {
  let text = html_encode(message.text);
  let data = message.emotes;
  return text
    .replace(
      /([^\s]*)/gi,
      function(m, key) {
        let result = data.filter(emote => {
          return emote.name === key
        });
        if (typeof result[0] !== "undefined" && provider == 'mixer') {
          let url = result[0]['urls'][1];
          let x = result[0].coords.x;
          let y = result[0].coords.y;
          return `<div title=":wat" class="emote" style="width: 24px; height: 24px; display: inline-block; background-image: url(${url}); background-position: -${x}px -${y}px;"></div>`;
        } else if (typeof result[0] !== "undefined" && provider == 'twitch') {
          let url = result[0]['urls'][4];
          return `<img alt="" src="${url}" class="emote"/>`;
        } else {
          return key;
        }
      });
}

function html_encode(e) {
  return e.replace(/[\<\>\"\^]/g, function(e) {
    return "&#" + e.charCodeAt(0) + ";";
  });
}

function addEvent(username, badges, message, isAction, color) {

  totalMessages += 1;
  let actionClass = "";
  if (isAction) {
    actionClass = "action";
  }
  const element = $.parseHTML(`
             <div class="chatMsg" data-from="${username}" data-id="${totalMessages}" id="msg-${totalMessages}">
             <div class="innerChat">
        <div class="backgroundHolder">
          <div class="chatBg"></div>
        </div>
            <span class="meta" style="color: ${color}">
              <span class="inner">
                <span class="badges">${badges}</span>
                <span class="name {enableCustomName}">${anonChatters ? anonName(username) : username}</span>
                <span class="separator">{separator}</span>
              </span>
            </span>
            <span class="message rightMsg">
              <span class="inner">${anonChatters ? anonNameMsgCheck(message) : message}</span>
            </span>
          </div>
        </div>`);
  if (hideAfter !== 999) {
    $(element).appendTo('#log');
    $('#log .chatMsg:last-child').attr('msg', 'msg-' + totalMessages);
    TweenMax.set('#msg-' + totalMessages, {
      opacity: 1
    });
    TweenMax.from('#msg-' + totalMessages + ' .chatBg', 1, {
      delay: .1,
      ease: Elastic.easeInOut,
      opacity: 1,
      x: "-900px",
      y: "0%"
    });
    animate(totalMessages);

    function animate(totalMessages) {
      TweenMax.from("#msg-" + totalMessages + ' .inner', .5, {
        delay: 1,
        opacity: 0,
        x: "0%",
        y: "-5px",
        ease: Elastic.easeInOut,
        opacity: 0
      });
    }
    $(element).appendTo('#log').delay(hideAfter * 1000).queue(function() {
      $(this).removeClass(animationIn).addClass(animationOut).delay(1000).queue(function() {
        $(this).remove()
      }).dequeue();
    });
  } else {
    $(element).appendTo('#log');
    $('#log .chatMsg:last-child').attr('msg', 'msg-' + totalMessages);
    TweenMax.set('#msg-' + totalMessages, {
      opacity: 1
    });
    TweenMax.from('#msg-' + totalMessages + ' .chatBg', 1, {
      delay: .1,
      ease: Elastic.easeInOut,
      opacity: 1,
      x: "-900px",
      y: "0%"
    });
    animate(totalMessages);

    function animate(totalMessages) {
      TweenMax.from("#msg-" + totalMessages + ' .inner', .5, {
        delay: 1,
        opacity: 0,
        x: "0%",
        y: "-5px",
        ease: Elastic.easeInOut,
        opacity: 0
      });
    }

  }
  if (totalMessages > messagesLimit) {

    removeRow(totalMessages - messagesLimit);
  }
}

function removeRow(id) {
  console.log(id);
  if (!$(`#msg-${id}`).length) {
    return;
  }
  if (animationOut !== "none" || !$(`#msg-${id}`).hasClass(animationOut)) {
    if (hideAfter !== 999) {
      $(`#msg-${id}`).dequeue();
    } else {
      $(`#msg-${id}`).addClass(animationOut).delay(1000).queue(function() {
        $(this).remove().dequeue()
      });

    }
    return;
  }

  $(`#msg-${id}`).animate({
    height: 0,
    opacity: 0
  }, 'slow', function() {
    $(`#msg-${id}`).remove();
  });
}

function loadScript(url) {
  return new Promise(function(resolve, reject) {
    const script = document.createElement('script')
    script.onload = resolve
    script.onerror = reject

    script.src = url

    document.head.appendChild(script)
  })
}



//******************************************
//anon add on
//******************************************

let chatters = {};

function anonName(username) {
  if (!chatters[username]) { //check if user is already in the master list
    let anonName = `${emotes[Math.floor(Math.random() * emotes.length)]}${Math.floor(Math.random()*1000)}`;
    chatters[username] = { //build chatter object
      anonName: anonName
    };
    return chatters[username].anonName
  } else return chatters[username].anonName
};

function anonNameMsgCheck(msg) {
  if(msg.indexOf('@') === -1) return msg
  else {
    return msg.split(' ').map(i => {
      if(i[0] !== '@') return i;
      try {
        let target = i.replace(/[^a-zA-Z0-9]/g,''),
          targetAnonName = chatters[target].anonName;
        return i.replace(target,targetAnonName);
      } catch {
        return i;
      };
    }).join(' ');
  }
};


//******************************************
//fake chat
//******************************************
const testChats = [
{username: 'chatter1', badges: [], message: "first!", nextMsg: 2000},
{username: 'mod1', badges: ['moderator','partner'], message: "Hey @chatter1!", nextMsg: 3000},
{username: 'streamer', badges: ['broadcaster'], message: "You were first @chatter1!", nextMsg: 1000},
{username: 'streamer', badges: ['broadcaster'], message: "Hey @mod1!", nextMsg: 5000},
{username: 'chatter2', badges: ['vip'], message: "hey @chatter1 @mod1 @streamer!!!", nextMsg: 4000},
{username: 'troll1', badges: [], message: "notice me!", nextMsg: 1000},
{username: 'chatter3', badges: ['partner'], message: "y@y", nextMsg: 2000},
{username: 'mod1', badges: ['moderator','partner'], message: "why @troll1?!?", nextMsg: 2000},
{username: 'chatter3', badges: ['partner'], message: "a!!msg!!", nextMsg: 2000},
{username: 'troll1', badges: [], message: "hey", nextMsg: 1000},
{username: 'troll1', badges: [], message: "hey @mod1", nextMsg: 1000},
{username: 'troll1', badges: [], message: "hey @mod9", nextMsg: 1000},
{username: 'troll1', badges: [], message: "hey", nextMsg: 1000},
{username: 'mod1', badges: ['moderator'], message: ".... :rofl: @troll1", nextMsg: 500},
{username: 'troll1', badges: [], message: "hey", nextMsg: 1000},
{username: 'troll1', badges: [], message: "hey", nextMsg: 1000},
{username: 'chatter4', badges: ['staff','admin'], message: "k bye!", nextMsg: 60000},
];
let testChattersColor = {};
function testChat(msgId) {
  let userObj = testChats[msgId]
  let badges = userObj.badges.map(i => {
    return {
      url: badgeUrls[i]
    }
  });
  if(!testChattersColor[userObj.username]) testChattersColor[userObj.username] = `#${Math.floor(Math.random()*16777215).toString(16)}`; //build object for random colors of test chatters

  let eventData = {
    detail: {
      "listener": "message",
      "event": {
        "data": {
          "badges": badges,
          "text": userObj.message,
          "displayName": userObj.username,
          "displayColor": testChattersColor[userObj.username],
          "nick": userObj.username.toLowerCase(),
          "emotes": []
        }
      }
    }
  };
  let event = new CustomEvent('onEventReceived', eventData);
  window.dispatchEvent(event);
  msgId++;
  if(msgId >= testChats.length) msgId = 0; //loop chats
  setTimeout(() => testChat(msgId), userObj.nextMsg);
};

const badgeUrls = {
  broadcaster: "https://static-cdn.jtvnw.net/badges/v1/5527c58c-fb7d-422d-b71b-f309dcb85cc1/3",
  moderator: "https://static-cdn.jtvnw.net/badges/v1/3267646d-33f0-4b17-b3df-f923a41db1d0/3",
  vip: "https://static-cdn.jtvnw.net/badges/v1/b817aba4-fad8-49e2-b88a-7cc744dfa6ec/3",
  partner: "https://static-cdn.jtvnw.net/badges/v1/d12a2e27-16f6-41d0-ab77-b780518f00a3/3",
  staff: "https://static-cdn.jtvnw.net/badges/v1/d97c37bd-a6f5-4c38-8f57-4e4bef88af34/1",
  admin: "https://static-cdn.jtvnw.net/badges/v1/9ef7e029-4cdf-4d4d-a0d5-e2b3fb2583fe/1"

};



//spam
const emotes=["4Head","ANELE","ArgieB8","ArsonNoSexy","AsexualPride","AsianGlow","Awwdible","BabyRage","BatChest","BCWarrior","BegWan","BibleThump","BigBrother","BigPhish","BisexualPride","BlackLivesMatter","BlargNaut","bleedPurple","BloodTrail","BOP","BrainSlug","BrokeBack","BuddhaBar","CarlSmile","ChefFrank","cmonBruh","CoolCat","CoolStoryBob","copyThis","CorgiDerp","CrreamAwk","CurseLit","DAESuppy","DansGame","DarkMode","DatSheffy","DBstyle","DendiFace","DogFace","DoritosChip","DrinkPurple","duDudu","DxCat","EarthDay","EleGiggle","EntropyWins","ExtraLife","FailFish","FBBlock","FBCatch","FBChallenge","FBPass","FBPenalty","FBRun","FBSpiral","FBtouchdown","FootBall","FootGoal","FootYellow","FrankerZ","FreakinStinkin","FUNgineer","FutureMan","GayPride","GenderFluidPride","GingerPower","GivePLZ","GlitchCat","GlitchLit","GlitchNRG","GrammarKing","GreenTeam","GunRun","HassaanChop","HeyGuys","HolidayCookie","HolidayLog","HolidayOrnament","HolidayPresent","HolidaySanta","HolidayTree","HotPokket","HSCheers","HSWP","imGlitch","IntersexPride","InuyoFace","ItsBoshyTime","Jebaited","JKanStyle","JonCarnage","KAPOW","Kappa","KappaClaus","KappaPride","KappaRoss","KappaWealth","Kappu","Keepo","KevinTurtle","Kippa","KomodoHype","KonCha","Kreygasm","LesbianPride","LUL","Mau5","MaxLOL","mcaT","MercyWing1","MercyWing2","MikeHogu","MingLee","MorphinTime","MrDestructoid","MVGame","NinjaGrumpy","NomNom","NonBinaryPride","NotATK","NotLikeThis","OhMyDog","OneHand","OpieOP","OptimizePrime","OSFrog","panicBasket","PanicVis","PansexualPride","PartyHat","PartyTime","pastaThat","PeoplesChamp","PermaSmug","PicoMause","PinkMercy","PipeHype","PixelBob","PJSalt","PJSugar","PMSTwin","PogChamp","Poooound","PopCorn","PorscheWIN","PowerUpL","PowerUpR","PraiseIt","PRChase","PrimeMe","PunchTrees","PunOko","PurpleStar","RaccAttack","RalpherZ","RedCoat","RedTeam","ResidentSleeper","riPepperonis","RitzMitz","RlyTho","RuleFive","SabaPing","SeemsGood","SeriousSloth","ShadyLulu","ShazBotstix","ShowOfHands","SingsMic","SingsNote","SmoocherZ","SMOrc","SoBayed","SoonerLater","Squid1","Squid2","Squid3","Squid4","SSSsss","StinkyCheese","StinkyGlitch","StoneLightning","StrawBeary","SuperVinlin","SwiftRage","TakeNRG","TBAngel","TearGlove","TehePelo","TF2John","ThankEgg","TheIlluminati","TheRinger","TheTarFu","TheThing","ThunBeast","TinyFace","TombRaid","TooSpicy","TPcrunchyroll","TPFufun","TransgenderPride","TriHard","TTours","TwitchLit","twitchRaid","TwitchRPG","TwitchSings","TwitchUnity","TwitchVotes","UncleNox","UnSane","UWot","VirtualHug","VoHiYo","VoteNay","VoteYea","WholeWheat","WTRuck","WutFace","YouDontSay","YouWHY"];
