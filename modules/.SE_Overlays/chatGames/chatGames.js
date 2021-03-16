/*
New Chatter Dock 2.0.2 by pjonp

Made pretty with help from JayniusGamingTV

The MIT License (MIT)
Copyright (c) 2021 pjonp
*/

/*
***************************
Advanced Settings
***************************
*/
let clearAllData = false,
  maxLeaderboardRows = 10, //Number of chatters to show on leaderboard
  maxChatHistoryLength = 50, //Maximum number of chats per user before clean-up
  chatActivityMinPoints = 1, //Minimum Points on the slider for bonus points
  chatActivityMaxPoints = 150, //Maximum Points on the slider for bonus points
  chatQuestionEasyPoints = 50,
  chatQuestionMedPoints = 75,
  chatQuestionHardPoints = 100,
  chatterByPassName = 'user name', //allows a user to post to HUD multiple times (IE everytime a bot command is called) !LOWERCASE!
  chatterByPassTrigger = '#'; //message from above must start with this

//*************************

let ignoredChatters = [],
  jebaitedAPIToken = '{{FDjebaitedtoken}}', //from settings
  jebaitedAPI = new Jebaited(jebaitedAPIToken),
  regexArray = [], //built by the games
  GameDB = {}, //built on load with the database
  chatterSettings = { //master settings object for chat tracking
    totalCount: 0,
    lineCount: 0,
    maxLines: 10,
    getLevel: (a) => a.tags.badges.indexOf("vip") !== -1 ? 'vip' : a.tags.mod === '1' ? 'mod' : a.tags.subscriber === '1' ? 'sub' : 'other', //in order -> VIP > MOD > SUB > OTHER (chatter only gets 1 tag)
    vip: {
      enabled: true,
      count: 0
    },
    mod: {
      enabled: true,
      count: 0
    },
    sub: {
      enabled: true,
      count: 0
    },
    other: {
      enabled: true,
      count: 0
    }
  },
  chatters = {}, //master chatter object per session;
  chatQuestionGameSetup = {}; //built from fieldData
/* chatter {}:
{
  id1: {displayName: 'USERname1', time: 2349, message: 'message', level: 'mod', activity: []},
  id2: {displayName: 'User2', time: 3294, message: 'sdiojsfd', level: 'other', activity: []}
}
*/

/*
//chat tracking hidden function Builders.filterChats(x,y): users with y # of chats in x minutes.
setTimeout( ()=> {
  console.log(Builders.filterChats()); //default: any chat in last 5 minutes. Builders.filterChat(5,0)
},40000)
*/

const GAMES_SETTINGS = { //built with settings and database
  "chatQuestion": { //game name variable
    "name": "Chat Trivia", //display name
    "leaderboard": {
      "game": "chatQuestion"
    } //Leave default. Saved in the SE database
  },
  "randomPin": {
    "name": "Random Pin",
    "leaderboard": {
      "game": "randomPin"
    } //Leave default. Saved in the SE database
  },
  "scrambleWord": {
    "name": "Scramble Word",
    "leaderboard": {
      "game": "scrambleWord"
    } //Leave default. Saved in the SE database
  },
  "chatActivity": {
    "name": "Chat Activity"
  }
};
/* LEADERBOARD JSON REFERENCE
{
userID: {
          displayName: '',
          wins: #,
          lastWin: time,
        }
}
*/

let Game = {
  wait: (ms) => new Promise(r => setTimeout(r, ms)),
  verifyLoad: () => Promise.all([jebaitedAPI.checkScope('botMsg'), jebaitedAPI.checkScope('addPoints'), Game.getDB()]).then(loadGames).catch(displayError),
  say: (msg) => { //say to chat
    jebaitedAPI.sayMessage(`/me ${msg}`).catch(e => console.log('jebaited.sayMessage: ', e));
  },
  givePoints: (user, points) => { //give points
    jebaitedAPI.addPoints(user, points).then(d => console.log(`${points} points added to ${user}`)).catch(e => console.log('jebaited.addPoints: ', e));
  },
  getDB: () => { //load database
    return new Promise((resolve, reject) => {
      SE_API.store.get('chatGamesDock').then(obj => {
        GameDB = obj;
        resolve('Database Loaded!');
      }).catch(() => {
        console.log('Error loading Database!');
        reject('Error loading Database!');
      });
    });
  },
  saveDB: () => { //save database
    return new Promise((resolve, reject) => {
      SE_API.store.set('chatGamesDock', GameDB).then(res => {
        if (res.message.startsWith('success')) resolve('Database Saved!')
        else throw new Error(res.message);
      }).catch((e) => {
        console.log('Error saving Database!', e);
        reject('Error saving Database!');
      });
    });
  }
};

function loadGames() {
  //SET UP CHATTER DOCK BUTTON
  document.getElementById(`chattersPill`).addEventListener('click', e => { //add button listener
    e.preventDefault();
    Builders.setActiveGame('chatters'); //change button CSS and switch to game panel
  })
  // /chatter dock button
  if (!GameDB) GameDB = GAMES_SETTINGS; //error on first load of database.
  //check if new game added in this code
  for (const [key] of Object.entries(GAMES_SETTINGS)) { //Make sure the DB has all the games in the code
    if (!GameDB[key]) GameDB[key] = GAMES_SETTINGS[key]; //If a game doesn't exist then add it.
  };
  //update the database for all changed settings. not LEADERBOARD!
  for (const [gameObj] of Object.entries(GAMES_SETTINGS)) {
    for (const [key] of Object.entries(GAMES_SETTINGS[gameObj])) {
      if (key === 'leaderboard') continue; //SKIP LEADERBOARD; check if it exists
      else GameDB[gameObj][key] = GAMES_SETTINGS[gameObj][key]; //sync the loaded database settings to the overlay options
    };
  };
  console.log('Game Data: ', GameDB)
  for (const [key] of Object.entries(GameDB)) { //for each game loaded
    try {
      console.log(`Loading Game: ${key}`);
      GAMES_LOGIC[key].onLoad(key); //load the game
    } catch (e) {
      console.log(`Error loading game: ${key}: `, e) //if it fails, skip to next
      $(`#${key}Pill`).remove();
      continue;
    };
  };
  return;
};

function displayError(e, critical = true) {
  console.log('Lodaing Error: ', e);
  if (critical) {
    $('#navBar').html(`<div class='text-danger' style='font-size:11px margin:auto'>${e.error ? e.error : e}.<br>Game disabled.</div>`);
    Game.wait(60000).then(() => $('#navBar').html(''));
  } else {
    $('#navBar').prepend(`<div id='errorText' class='text-danger' style='font-size:11px margin:auto'>${e.error ? e.error : e}.<br>Game disabled.</div>`);
    Game.wait(60000).then(() => $('#errorText').remove());
  }
};

window.addEventListener('onWidgetLoad', obj => {
  if (clearAllData) return Game.saveDB();
  fieldData = obj.detail.fieldData;
  //chat dock
  ignoredChatters = fieldData.ignoredChattersFD.replace(/ /g, '').split(',') || []; //get ignored list and build array from input
  //
  chatterSettings.vip.enabled = fieldData.FDenableVip === 'yes';
  chatterSettings.mod.enabled = fieldData.FDenableMod === 'yes';
  chatterSettings.sub.enabled = fieldData.FDenableSub === 'yes';
  chatterSettings.other.enabled = fieldData.FDenableOther === 'yes';
  chatterSettings.maxLines = fieldData.FDmaxLines || chatterSettings.maxLines; //clean up chats

  // /chatdock
  //Get field data...
  GAMES_SETTINGS.chatQuestion.chatStartTrigger = fieldData.FDchatQuestionStartTrigger;
  GAMES_SETTINGS.chatQuestion.chatEndText = fieldData.FDchatQuestionEndText;
  GAMES_SETTINGS.chatQuestion.points = fieldData.FDchatQuestionPoints;
  GAMES_SETTINGS.chatQuestion.pointsAdder = fieldData.FDchatQuestionPointsAdder;
  GAMES_SETTINGS.chatQuestion.autoPlay = fieldData.FDchatQuestionAutoPlay === 'yes';
  GAMES_SETTINGS.chatQuestion.gameDelay = fieldData.FDchatQuestionAutoTime * 60;
  GAMES_SETTINGS.chatQuestion.gameDelayAdder = fieldData.FDchatQuestionAutoTimeAdder * 60 || 0;
  chatQuestionGameSetup = {
    "gAPI": fieldData.FDchatQuestionGAPIKey,
    "gSheetId": fieldData.FDchatQuestionSheetID,
    "gSheetName": fieldData.FDchatQuestionSheetName
  };
  //
  GAMES_SETTINGS.randomPin.chatStartTrigger = fieldData.FDrandomPinStartTrigger;
  GAMES_SETTINGS.randomPin.chatEndText = fieldData.FDrandomPinEndText;
  GAMES_SETTINGS.randomPin.points = fieldData.FDrandomPinPoints;
  GAMES_SETTINGS.randomPin.pointsAdder = fieldData.FDrandomPinPointsAdder;
  GAMES_SETTINGS.randomPin.autoPlay = fieldData.FDrandomPinAutoPlay === 'yes';
  GAMES_SETTINGS.randomPin.gameDelay = fieldData.FDrandomPinAutoTime * 60;
  GAMES_SETTINGS.randomPin.gameDelayAdder = fieldData.FDrandomPinAutoTimeAdder * 60 || 0;
  //
  GAMES_SETTINGS.scrambleWord.chatStartTrigger = fieldData.FDscrambleWordStartTrigger;
  GAMES_SETTINGS.scrambleWord.chatEndText = fieldData.FDscrambleWordEndText;
  GAMES_SETTINGS.scrambleWord.points = fieldData.FDscrambleWordPoints;
  GAMES_SETTINGS.scrambleWord.pointsAdder = fieldData.FDscrambleWordPointsAdder;
  GAMES_SETTINGS.scrambleWord.autoPlay = fieldData.FDscrambleWordAutoPlay === 'yes';
  GAMES_SETTINGS.scrambleWord.gameDelay = fieldData.FDscrambleWordAutoTime * 60;
  GAMES_SETTINGS.scrambleWord.gameDelayAdder = fieldData.FDscrambleWordAutoTimeAdder * 60 || 0;
  //
  GAMES_SETTINGS.chatActivity.announceBonus = fieldData.FDchatActivityAnnounceBonus === 'yes';
  GAMES_SETTINGS.chatActivity.bonusMsg = fieldData.FDchatActivityBonusMsg || '{points} bonus points have been given to {amount} chatters for sending more than {chats} chats in the last {time} minutes!';
  GAMES_SETTINGS.chatActivity.timeframe = fieldData.FDchatActivityTimeframe || 5;
  GAMES_SETTINGS.chatActivity.chatMin = fieldData.FDchatActivityChatMin || 2;
  GAMES_SETTINGS.chatActivity.points = fieldData.FDchatActivityPoints || 10;

  (() => Game.wait(obj.detail.overlay.isEditorMode ? 1500 : 0).then(Game.verifyLoad))();

});

window.addEventListener('onEventReceived', obj => {
  if (obj.detail.listener !== "message") return;
  let data = obj.detail.event.data;

  //FILTER OUT IGNORED CHATTERS!!!!
  if (ignoredChatters.some(i => i.toLowerCase() === data.nick)) return;

  //Game checks
  regexArray.forEach((item, i) => {
    if (item.trigger.test(data.text) === false) return; //check each chat message if it matches a game word
    regexArray.splice(i, 1); //remove the trigger from the list
    GAMES_LOGIC[item.game].gameOver(item.game, data); //call endgmae function when triggered
  });
  // /Game Checks
  if (!chatters[data.userId]) { //check if user is already in the master list (already chatted) based on "nick" (lowercase username).
    let level = chatterSettings.getLevel(data); //get/save level
    chatters[data.userId] = { //build chatter object
      displayName: data.displayName, //display name to show later (keys forced to lowercase for user input)
      time: Date.now(), //time of message; not used but could track (not chatted this stream for X amount of time or !lurk)
      message: obj.detail.event.renderedText, //message sent to chat (data.text)
      level: level, //vip/sub/mod
      activity: [data.time] //secret
    };
    updateDisplay(data.userId); //send the "key" to update
    return;
  } else { //update time and message
    chatters[data.userId].time = data.time;
    chatters[data.userId].message = obj.detail.event.renderedText;
    chatters[data.userId].activity.unshift(Date.now()); //secrets
    if (chatters[data.userId].activity.length > maxChatHistoryLength) chatters[data.userId].activity.pop();
    if(data.nick === chatterByPassName && obj.detail.event.renderedText.startsWith(chatterByPassTrigger)) updateDisplay(data.userId, false);
  };
});

/*
***********************
CHATTER DOCK
***********************
*/
const updateDisplay = (userId, updateCount = true) => { //update based on username "key"
  let chatData = chatters[userId]; //get Chatter object
  if(updateCount) {
    chatterSettings.totalCount++; //add 1 to the total count
    chatterSettings[chatData.level].count++; //add 1 to the sub-stat (mod/vip/sub)
  $(`#totalChatters`).text(chatterSettings.totalCount); //update total HTML
  $(`#${chatData.level}Chatters`).text(chatterSettings[chatData.level].count); //update sub-stat HTML
};
  if (chatterSettings[chatData.level].enabled) { //if display this type (vip/mod)
    //************************
    //HTML STRING
    let HTMLString = `<div class='msg' style='display:none'><span class='msgUser ${chatData.level}'>${chatData.displayName}</span><br><div class='msgUserChat'>${chatData.message}</div></div>`;
    //HTML STRING
    //************************
    let msgContainer = $('#msgContainer');
    msgContainer.children().first().removeClass("blink popInLeft"); //reset animations
    msgContainer.prepend(HTMLString); //add new message
    msgContainer.children().first().fadeIn().addClass("blink popInLeft"); //fade in animation
    chatterSettings.lineCount++;
    if (chatterSettings.lineCount > chatterSettings.maxLines) msgContainer.children().last().remove(); //clear up old containers
    return;
  } else return;
};


/*
***********************
GAMES
***********************
*/

const GAMES_LOGIC = {
  /*
  ***********************
  CHAT QUESTION
  ***********************
  */
  chatQuestion: {
    running: false,
    questionIndex: null,
    question: null,
    answer: null,
    points: null,
    runningTimer: null,
    onLoad: (game) => {
      Builders.buildHtml(game); //build HTML
      if (chatQuestionGameSetup.gAPI.length > 1) loadQuestionsDatabase()
        .catch(e => {
          GAMES_SETTINGS[game].autoPlay = false;
          displayError(`Chat Question Sheet Data:<br>${e}`, false);
        })
        .finally(() => GAMES_LOGIC[game].startButton(game))
      else GAMES_LOGIC[game].startButton(game);
    },
    startButton: (game) => {

      document.getElementById("chatQStartButton").addEventListener('click', e => { //build button
        e.preventDefault();
        let data = {
          question: $('#chatQQuestion').val(),
          trigger: $('#chatQAnswer').val()
        }
        let valid = true; //validate data
        if (data.question.length < 5) {
          $('#chatQQuestionInvalid').removeClass('d-none');
          valid = false;
        } else $('#chatQQuestionInvalid').addClass('d-none');
        if (data.trigger.length < 3) {
          $('#chatQAnswerInvalid').removeClass('d-none');
          valid = false;
        } else $('#chatQAnswerInvalid').addClass('d-none');
        if (!valid) return;
        GAMES_LOGIC[game].question = data.question;
        GAMES_LOGIC[game].answer = data.trigger;
        GAMES_LOGIC[game].points = Builders.randomNumber(GameDB[game].points, GameDB[game].points + GameDB[game].pointsAdder);
        GAMES_LOGIC[game].startGame(game);
      });

      let startRandomQuestion = () => {
        let randQuestionIndex = Math.floor(Math.random() * Questions.length),
          randQuestionObject = Questions[randQuestionIndex];

        GAMES_LOGIC[game].questionIndex = randQuestionIndex;
        GAMES_LOGIC[game].question = randQuestionObject[0];
        GAMES_LOGIC[game].answer = randQuestionObject[1];
        let points = randQuestionObject[2].toLowerCase();
        points = parseInt(points) ? parseInt(points) : points === 'easy' ? chatQuestionEasyPoints : points === 'medium' ? chatQuestionMedPoints : points === 'hard' ? chatQuestionHardPoints : chatQuestionEasyPoints; //set points
        GAMES_LOGIC[game].points = points;

        $('#chatQQuestion').val(GAMES_LOGIC[game].question);
        $('#chatQAnswer').val(GAMES_LOGIC[game].answer);

        GAMES_LOGIC[game].startGame(game); //if autoPlay
      };


      let cqTimeUpdate = (secs) => { //format & update time
        let formatedTime = Builders.formatTime(secs);
        $(`#${game}CDTimer`).html(formatedTime); //update time in HTML
        GAMES_LOGIC[game].autoPlayTimer = setTimeout(() => { //repeat every second
          if (secs === 0) startRandomQuestion()
          else cqTimeUpdate(secs -= 1);
        }, 1000)
      };

      if (GAMES_SETTINGS[game].autoPlay || Questions) {

        $(`#${game}Menu`).prepend(`
        <div class='text' id='${game}CDTimerContainer'>Auto Start: <span id="${game}CDTimer">Disabled</span></div>
        <div class='text'>Questions Left: <span id="${game}QueueAmount">${Questions.length}</span></div>
        `);

        $(`#${game}Menu form`).append(
          `<div class="flex-row align-items-center">
                  <button class="btn btn-outline-warning" id="${game}RandomButton">Start Random Question</button>
                </div>`);


        if (Questions.length === 0) {
          $(`#${game}RandomButton`).remove();
          $(`#${game}CDTimerContainer`).remove();
          $(`#${game}QueueAmount`).html('No Questions Left!');
        } else {

          document.getElementById(`${game}RandomButton`).addEventListener('click', e => { //build button
            e.preventDefault();
            startRandomQuestion();
          });
        if (GAMES_SETTINGS[game].autoPlay) cqTimeUpdate(Builders.randomNumber(GameDB[game].gameDelay, GameDB[game].gameDelay + GameDB[game].gameDelayAdder));
        };
      };

    },
    startGame: (game) => {
      clearTimeout(GAMES_LOGIC[game].autoPlayTimer); //clear game timer
      if (GAMES_LOGIC[game].running) return; //Only allow 1 instance of the game (should never get dupes)
      GAMES_LOGIC[game].running = true; //set to running
      console.log('chatQuestion Game Started!');

      regexArray.push({
        game: game,
        trigger: new RegExp(`((?<=\\s|^))(${GAMES_LOGIC[game].answer})(?!\\w)`, "i")
      });
      let res = `${GAMES_SETTINGS[game].chatStartTrigger} ${GAMES_LOGIC[game].question}`;
      Game.say(res);

      Builders.menuChange(game, GAMES_LOGIC[game].runningHtml(game)); //update the menu; lock options, switch button
      document.getElementById("chatQStopButton").addEventListener('click', e => { //add stop button function
        e.preventDefault();
        GAMES_LOGIC[game].stopGame(game);
      });
      let cqTimeUpdate = (secs) => { //format & update time
        let formatedTime = Builders.formatTime(secs);
        $(`#${game}Timer`).html(formatedTime); //update time in HTML
        GAMES_LOGIC[game].runningTimer = setTimeout(() => { //repeat every second
          cqTimeUpdate(secs += 1)
        }, 1000)
      };
      cqTimeUpdate(0); //start timer function
    },
    stopGame: (game) => {
      clearTimeout(GAMES_LOGIC[game].runningTimer); //clear game timer
      GAMES_LOGIC[game].running = false; //set to not running


      regexArray.forEach((item, i) => {
        if (item.trigger.test(GAMES_LOGIC[game].answer) === false) return; //find the game trigger
        regexArray.splice(i, 1); //remove the trigger from the list
      });
      GAMES_LOGIC[game].questionIndex = null;
      GAMES_LOGIC[game].question = null; //empty the data
      GAMES_LOGIC[game].answer = null; //empty the data
      GAMES_LOGIC[game].points = null;


      Builders.menuChange(game, GAMES_LOGIC[game].menuHtml(game)); //change dashboard back to main menu
      Builders.buildLeaderBoard(game);
      GAMES_LOGIC[game].startButton(game); //build event for start button
    },
    gameOver: (game, data) => {

      //let wins = GameDB[game]?.leaderboard[data.userId]?.wins !== undefined ? GameDB[game].leaderboard[data.userId].wins + 1 : 1, //no good with OBS
      let wins = () => { //check if user exists already in leaderboard & get old points
          try {
            return GameDB[game].leaderboard[data.userId].wins;
          } catch {
            return 0
          }
        },
        leaderboardObj = { //build winners object
          displayName: data.displayName.slice(0, 16),
          wins: wins() + 1, //check if user exists already in leaderboard & get old points; and add 1
          lastWin: data.time
        };
      //refresh leaderboard
      GameDB[game].leaderboard[data.userId] = leaderboardObj; //update object
      //save data
      let points = GAMES_LOGIC[game].points;
      if (GAMES_LOGIC[game].questionIndex !== null) Questions.splice(GAMES_LOGIC[game].questionIndex, 1); //remove quesiton from list;
      GAMES_LOGIC[game].stopGame(game);
      //give points
      Game.givePoints(data.nick, points);
      //announce winner
      Game.say(`${GameDB[game].chatEndText.replace('{winner}', data.displayName).replace('{points}', points)}`);
      //save data
      Game.saveDB().catch();
    },
    menuHtml: (game) => { //Menu HTML
      return (
        `<div class='text'>Last Winner: <span id="${game}LastWinner">No winners yet!</span></div>
      <form>
         <div class="form-group">
            <textarea class="form-control" id="chatQQuestion" rows="5" placeholder="QUESTION"></textarea>
            <div id="chatQQuestionInvalid" class='text-danger d-none'>Must be more than 5 characters</div>
         </div>
        <div class="form-group">
          <input type="text" class="form-control" id="chatQAnswer" placeholder="ANSWER">
          <div id="chatQAnswerInvalid" class='text-danger d-none'>Must be more than 3 characters</div>
        </div>
        <button id='chatQStartButton' class="btn btn-outline-success">Start Game</button>
  	 </form>`
      )
    },
    runningHtml: (game) => { //Running HTML, add timer, lock inputs, change button
      return (
        `<div class='text'>Running Time: <span id="${game}Timer">0</span></div>
     <form>
         <div class="form-group">
            <textarea class="form-control" rows="5" placeholder="${GAMES_LOGIC[game].question}" disabled></textarea>
         </div>
        <div class="form-group">
          <input type="text" class="form-control" placeholder="${GAMES_LOGIC[game].answer}" disabled>
        </div>
        <button id='chatQStopButton' class="btn btn-outline-danger">Stop Game</button>
  	 </form>`
      )
    }
  },
  /*
  ***********************
  RANDOM PIN
  ***********************
  */
  randomPin: {
    running: false,
    question: null,
    answer: null,
    points: null,
    runningTimer: null,
    autoPlayTimer: null,
    onLoad: (game) => {
      Builders.buildHtml(game); //build HTML
      GAMES_LOGIC[game].startButton(game); //build event for button & logic
    },
    startButton: (game) => {

      let randomNumber = (len) => {
        let numString = '';
        for (let i = 0; numString.length < len; i++) {
          if (i === 100) throw new Error('infinite loop');
          let randNum = `${Math.floor(Math.random()*10)}` //get random number
          if (randNum !== numString[numString.length - 1]) numString += randNum; //prevent all of the name number
        }
        return numString;
      }
      document.getElementById("randomLength3").addEventListener('click', e => { //build button
        e.preventDefault();
        $('#randomPinAnswer').val(randomNumber(3));
      });
      document.getElementById("randomLength4").addEventListener('click', e => { //build button
        e.preventDefault();
        $('#randomPinAnswer').val(randomNumber(4));
      });
      document.getElementById("randomLength5").addEventListener('click', e => { //build button
        e.preventDefault();
        $('#randomPinAnswer').val(randomNumber(5));
      });

      document.getElementById("randomPinStartButton").addEventListener('click', e => { //build button
        e.preventDefault();
        let answer = $('#randomPinAnswer').val();

        if (answer.length < 3) {
          $('#randomPinAnswerInvalid').removeClass('d-none');
          return;
        } else $('#randomPinAnswerInvalid').addClass('d-none');

        //randomize pin!

        GAMES_LOGIC[game].answer = answer;
        GAMES_LOGIC[game].question = Builders.randomizeString(answer);
        GAMES_LOGIC[game].points = Builders.randomNumber(GameDB[game].points, GameDB[game].points + GameDB[game].pointsAdder);
        GAMES_LOGIC[game].startGame(game);
      });

      let rpTimeUpdate = (secs) => { //format & update time
        let formatedTime = Builders.formatTime(secs);
        $(`#${game}CDTimer`).html(formatedTime); //update time in HTML
        GAMES_LOGIC[game].autoPlayTimer = setTimeout(() => { //repeat every second
          if (secs === 0) {
            let randNum = randomNumber(3)
            $('#randomPinAnswer').val(randNum);
            GAMES_LOGIC[game].answer = randNum;
            GAMES_LOGIC[game].question = Builders.randomizeString(randNum);
            GAMES_LOGIC[game].points = Builders.randomNumber(GameDB[game].points, GameDB[game].points + GameDB[game].pointsAdder);
            GAMES_LOGIC[game].startGame(game); //if autoPlay, start the game not used for this game
          } else rpTimeUpdate(secs -= 1);
        }, 1000)
      };

      if (GAMES_SETTINGS[game].autoPlay) rpTimeUpdate(Builders.randomNumber(GameDB[game].gameDelay, GameDB[game].gameDelay + GameDB[game].gameDelayAdder));

    },
    startGame: (game) => {
      clearTimeout(GAMES_LOGIC[game].autoPlayTimer); //clear game timer
      if (GAMES_LOGIC[game].running) return; //Only allow 1 instance of the game (should never get dupes)
      GAMES_LOGIC[game].running = true; //set to running
      console.log('randomPin Game Started!');

      regexArray.push({
        game: game,
        trigger: new RegExp(`((?<=\\s|^))(${GAMES_LOGIC[game].answer})(?!\\w)`, "i")
      });
      let res = `${GAMES_SETTINGS[game].chatStartTrigger} ${GAMES_LOGIC[game].question}`;
      Game.say(res);

      Builders.menuChange(game, GAMES_LOGIC[game].runningHtml(game)); //update the menu; lock options, switch button
      document.getElementById("randomPinStopButton").addEventListener('click', e => { //add stop button function
        e.preventDefault();
        GAMES_LOGIC[game].stopGame(game);
      });
      document.getElementById("randomPinRepostButton").addEventListener('click', e => { //add stop button function
        e.preventDefault();
        let res = `${GAMES_SETTINGS[game].chatStartTrigger}: ${GAMES_LOGIC[game].question}`;
        Game.say(res);
      });
      let rpTimeUpdate = (secs) => { //format & update time
        let formatedTime = Builders.formatTime(secs);
        $(`#${game}Timer`).html(formatedTime); //update time in HTML
        GAMES_LOGIC[game].runningTimer = setTimeout(() => { //repeat every second
          rpTimeUpdate(secs += 1)
        }, 1000)
      };
      rpTimeUpdate(0); //start timer function
    },
    stopGame: (game) => {
      clearTimeout(GAMES_LOGIC[game].runningTimer); //clear game timer
      GAMES_LOGIC[game].running = false; //set to not running

      regexArray.forEach((item, i) => {
        if (item.trigger.test(GAMES_LOGIC[game].answer) === false) return; //find the game trigger
        regexArray.splice(i, 1); //remove the trigger from the list
      });
      GAMES_LOGIC[game].question = null; //empty the data
      GAMES_LOGIC[game].answer = null; //empty the data
      GAMES_LOGIC[game].points = null;

      Builders.menuChange(game, GAMES_LOGIC[game].menuHtml(game)); //change dashboard back to main menu
      Builders.buildLeaderBoard(game);
      GAMES_LOGIC[game].startButton(game); //build event for start button
    },
    gameOver: (game, data) => {
      //let wins = GameDB[game]?.leaderboard[data.userId]?.wins !== undefined ? GameDB[game].leaderboard[data.userId].wins + 1 : 1, //no good with OBS
      let wins = () => { //check if user exists already in leaderboard & get old points
          try {
            return GameDB[game].leaderboard[data.userId].wins;
          } catch {
            return 0
          }
        },
        leaderboardObj = { //build winners object
          displayName: data.displayName.slice(0, 16),
          wins: wins() + 1, //check if user exists already in leaderboard & get old points; and add 1
          lastWin: data.time
        };
      //refresh leaderboard
      GameDB[game].leaderboard[data.userId] = leaderboardObj; //update object
      //save data
      let points = GAMES_LOGIC[game].points;
      GAMES_LOGIC[game].stopGame(game);
      //give points
      Game.givePoints(data.nick, points);
      //announce winner
      Game.say(`${GameDB[game].chatEndText.replace('{winner}', data.displayName).replace('{points}', points)}`);
      //save data
      Game.saveDB().catch();
    },
    menuHtml: (game) => { //Menu HTML
      return (
        `<div class='text'>Last Winner: <span id="${game}LastWinner">No winners yet!</span></div>
     <div class='text'>Auto Start: <span id="${game}CDTimer">Disabled</span></div>
      <form>

        <div class="flex-row align-items-center text">
          Random #:
          <button class="btn btn-outline-info" id="randomLength3">3</button>
          <button class="btn btn-outline-info" id="randomLength4">4</button>
          <button class="btn btn-outline-info" id="randomLength5">5</button>
        </div>
      </div>
        <div class="form-group">
          <input type="text" class="form-control" id="randomPinAnswer" placeholder="PIN">
          <div id="randomPinAnswerInvalid" class='text-danger d-none'>Must be more than 3 characters</div>
        </div>
        <button id='randomPinStartButton' class="btn btn-outline-success">Start Game</button>
  	 </form>`
      )
    },
    runningHtml: (game) => { //Running HTML, add timer, lock inputs, change button
      return (
        `<div class='text'>Running Time: <span id="${game}Timer">0</span></div>
     <form>
        <div class="form-group">
          <input type="text" class="form-control" placeholder="${GAMES_LOGIC[game].answer}" disabled>
        </div>
        <button id='randomPinRepostButton' class="btn btn-outline-warning">Repost Message</button>
        <button id='randomPinStopButton' class="btn btn-outline-danger">Stop Game</button>
  	 </form>`
      )
    }
  },
  /*
  ***********************
  SCRAMBLED WORD
  ***********************
  */
  scrambleWord: {
    running: false,
    question: null,
    answer: null,
    points: null,
    runningTimer: null,
    autoPlayTimer: null,
    onLoad: (game) => {
      Builders.buildHtml(game); //build HTML
      GAMES_LOGIC[game].startButton(game); //build event for button & logic
    },
    startButton: (game) => {

      let randomWord = () => {
        return Words[Math.floor(Math.random() * Words.length)].toUpperCase(); //random word
      };

      document.getElementById("scrambleWordRandomButton").addEventListener('click', e => { //build button
        e.preventDefault();
        $('#scrambleWordAnswer').val(randomWord());
      });

      document.getElementById("scrambleWordStartButton").addEventListener('click', e => { //build button
        e.preventDefault();
        let answer = $('#scrambleWordAnswer').val().toUpperCase();

        if (answer.length < 3) {
          $('#scrambleWordAnswerInvalid').removeClass('d-none');
          return;
        } else $('#scrambleWordAnswerInvalid').addClass('d-none');

        GAMES_LOGIC[game].answer = answer;
        GAMES_LOGIC[game].question = Builders.randomizeString(answer);
        GAMES_LOGIC[game].points = Builders.randomNumber(GameDB[game].points, GameDB[game].points + GameDB[game].pointsAdder);
        GAMES_LOGIC[game].startGame(game);
      });

      let rpTimeUpdate = (secs) => { //format & update time
        let formatedTime = Builders.formatTime(secs);
        $(`#${game}CDTimer`).html(formatedTime); //update time in HTML
        GAMES_LOGIC[game].autoPlayTimer = setTimeout(() => { //repeat every second
          if (secs === 0) {
            let randWord = randomWord();
            $('#scrambleWordAnswer').val(randWord);
            GAMES_LOGIC[game].answer = randWord;
            GAMES_LOGIC[game].question = Builders.randomizeString(randWord);
            GAMES_LOGIC[game].points = Builders.randomNumber(GameDB[game].points, GameDB[game].points + GameDB[game].pointsAdder);
            GAMES_LOGIC[game].startGame(game); //if autoPlay, start the game not used for this game
          } else rpTimeUpdate(secs -= 1);
        }, 1000)
      };

      if (GAMES_SETTINGS[game].autoPlay) rpTimeUpdate(Builders.randomNumber(GameDB[game].gameDelay, GameDB[game].gameDelay + GameDB[game].gameDelayAdder));

    },
    startGame: (game) => {
      clearTimeout(GAMES_LOGIC[game].autoPlayTimer); //clear game timer
      if (GAMES_LOGIC[game].running) return; //Only allow 1 instance of the game (should never get dupes)
      GAMES_LOGIC[game].running = true; //set to running
      console.log('scrambleWord Game Started!');
      regexArray.push({
        game: game,
        trigger: new RegExp(`((?<=\\s|^))(${GAMES_LOGIC[game].answer})(?!\\w)`, "i")
      });
      let res = `${GAMES_SETTINGS[game].chatStartTrigger} ${GAMES_LOGIC[game].question}`;
      Game.say(res);

      Builders.menuChange(game, GAMES_LOGIC[game].runningHtml(game)); //update the menu; lock options, switch button
      document.getElementById("scrambleWordStopButton").addEventListener('click', e => { //add stop button function
        e.preventDefault();
        GAMES_LOGIC[game].stopGame(game);
      });
      document.getElementById("scrambleWordRepostButton").addEventListener('click', e => { //add stop button function
        e.preventDefault();
        let res = `${GAMES_SETTINGS[game].chatStartTrigger}: ${GAMES_LOGIC[game].question}`;
        Game.say(res);
      });
      let rpTimeUpdate = (secs) => { //format & update time
        let formatedTime = Builders.formatTime(secs);
        $(`#${game}Timer`).html(formatedTime); //update time in HTML
        GAMES_LOGIC[game].runningTimer = setTimeout(() => { //repeat every second
          rpTimeUpdate(secs += 1)
        }, 1000)
      };
      rpTimeUpdate(0); //start timer function
    },
    stopGame: (game) => {
      clearTimeout(GAMES_LOGIC[game].runningTimer); //clear game timer
      GAMES_LOGIC[game].running = false; //set to not running

      regexArray.forEach((item, i) => {
        if (item.trigger.test(GAMES_LOGIC[game].answer) === false) return; //find the game trigger
        regexArray.splice(i, 1); //remove the trigger from the list
      });
      GAMES_LOGIC[game].question = null; //empty the data
      GAMES_LOGIC[game].answer = null; //empty the data
      GAMES_LOGIC[game].points = null; //empty the data

      Builders.menuChange(game, GAMES_LOGIC[game].menuHtml(game)); //change dashboard back to main menu
      Builders.buildLeaderBoard(game);
      GAMES_LOGIC[game].startButton(game); //build event for start button
    },
    gameOver: (game, data) => {
      //let wins = GameDB[game]?.leaderboard[data.userId]?.wins !== undefined ? GameDB[game].leaderboard[data.userId].wins + 1 : 1, //no good with OBS
      let wins = () => { //check if user exists already in leaderboard & get old points
          try {
            return GameDB[game].leaderboard[data.userId].wins;
          } catch {
            return 0
          }
        },
        leaderboardObj = { //build winners object
          displayName: data.displayName.slice(0, 16),
          wins: wins() + 1, //check if user exists already in leaderboard & get old points; and add 1
          lastWin: data.time
        };
      //refresh leaderboard
      GameDB[game].leaderboard[data.userId] = leaderboardObj; //update object
      //save data
      let points = GAMES_LOGIC[game].points;
      GAMES_LOGIC[game].stopGame(game);
      //give points
      Game.givePoints(data.nick, points);
      //announce winner
      Game.say(`${GameDB[game].chatEndText.replace('{winner}', data.displayName).replace('{points}', points)}`);
      //save data
      Game.saveDB().catch();
    },
    menuHtml: (game) => { //Menu HTML
      return (
        `<div class='text'>Last Winner: <span id="${game}LastWinner">No winners yet!</span></div>
     <div class='text'>Auto Start: <span id="${game}CDTimer">Disabled</span></div>
      <form>

        <div class="flex-row align-items-center">
          <button class="btn btn-outline-info" id="scrambleWordRandomButton">Random Word</button>
        </div>
      </div>
        <div class="form-group">
          <input type="text" class="form-control" id="scrambleWordAnswer" placeholder="WORD">
          <div id="scrambleWordAnswerInvalid" class='text-danger d-none'>Must be more than 3 characters</div>
        </div>
        <button id='scrambleWordStartButton' class="btn btn-outline-success">Start Game</button>
  	 </form>`
      )
    },
    runningHtml: (game) => { //Running HTML, add timer, lock inputs, change button
      return (
        `<div class='text'>Running Time: <span id="${game}Timer">0</span></div>
     <form>
        <div class="form-group">
          <input type="text" class="form-control" placeholder="${GAMES_LOGIC[game].answer}" disabled>
        </div>
        <button id='scrambleWordRepostButton' class="btn btn-outline-warning">Repost Message</button>
        <button id='scrambleWordStopButton' class="btn btn-outline-danger">Stop Game</button>
  	 </form>`
      )
    }
  },
  /*
  ***********************
  CHAT Activity
  ***********************
  */
  chatActivity: {
    running: false,
    question: null,
    answer: null,
    points: null,
    runningTimer: null,
    autoPlayTimer: null,
    onLoad: (game) => {
      GameDB[game].leaderboard = {};
      Builders.buildHtml(game); //build HTML
      GAMES_LOGIC[game].startButton(game); //build event for button & logic
    },
    startButton: (game) => {
      let cATWSlider = $('#chatActivityTimeWindowRange'), //chat activity time window slider
        cACASlider = $('#chatActivityChatAmountRange'); //chat activity chat amount slider

      $('#chatActivityTimeWindow').html(cATWSlider.val()); // ^
      $('#chatActivityChatAmount').html(cACASlider.val()); // ^

      cATWSlider.on('input', () => $('#chatActivityTimeWindow').html(cATWSlider.val()));
      cACASlider.on('input', () => $('#chatActivityChatAmount').html(cACASlider.val()));
      document.getElementById("chatActivityStartButton").addEventListener("click", e => { //build button
        e.preventDefault();
        //start Game
        GAMES_LOGIC[game].startGame(game);
      });

    },
    startGame: (game) => {
      //enable AutoPlay ?
      //clearTimeout(GAMES_LOGIC[game].autoPlayTimer); //clear game timer
      let timeRange = $('#chatActivityTimeWindowRange').val(),
        chatMin = $('#chatActivityChatAmountRange').val();
      //GET CHAT STAT DATA
      let filterdUserIds = Builders.filterChats(timeRange, chatMin),
        filteredUserNames = []; //array of usernames to give points

      //  console.log(filterdUserIds);
      GameDB[game].leaderboard = {}; //clear old data;
      Object.keys(filterdUserIds).map(i => {
        filteredUserNames.push(chatters[i].displayName); //build array of names to give points
        let userObj = {
          displayName: chatters[i].displayName,
          wins: filterdUserIds[i],
          lastWin: Date.now()
        };
        GameDB[game].leaderboard[i] = userObj;
      });

      //update leader board
      Builders.buildLeaderBoard(game);
      $(`#${game}LBWinsTag`).html('Chats'); //Visual injection (change "wins" to "chats")

      Builders.setActiveMenu(game, `LB`); //Switch to leaderboard menu

      //set number of users in filter
      let countDisplayHtml = `<div class='text'>Updated: <span id="${game}LastUpdate">N/A</span></div><div class='text'><span class='fw-bold'>${filteredUserNames.length}</span> users have sent ${chatMin} messages in the last ${timeRange} minutes.</div>`
      $(`#${game}LB hr`).after(countDisplayHtml);
      $(`#${game}LastUpdate`).html(new Date().toLocaleString()); //set time of data grab
      //remove clear button (not needed)
      $(`#${game}ClearLBButton`).remove();
      //add slider and points button if filter > 0
      if (filteredUserNames.length > 0) {
        let pointsAddHtml = `
          <div id="chatActivityPointsOptions">
            <div class="form-group">
              <label class="form-label">Points To Add: <span id='chatActivityPointsTag'>?</span></label>
              <input type="range" class="form-range" min=${chatActivityMinPoints} max=${chatActivityMaxPoints} value=${GameDB[game].points} id="chatActivityPointsRange">
            </div>
            <button id='chatActivityPointButton' class="btn btn-outline-success">Give Points</button>
          </div>
          `
        $(`#${game}LB`).append(pointsAddHtml);
        //button logic
        let cAPSlider = $('#chatActivityPointsRange'); //chatActivityPointsSlider
        $('#chatActivityPointsTag').html(cAPSlider.val());
        cAPSlider.on('input', () => $('#chatActivityPointsTag').html(cAPSlider.val()));
        document.getElementById(`chatActivityPointButton`).addEventListener('click', e => { //add button listener
          e.preventDefault();
          GameDB[game].points = cAPSlider.val(); //chat acitivity points slider
          $('#chatActivityPointsOptions').remove();
          //add Points API Array: [ {username: user, amount: moneyIn}, ....]
          let jebaitedBulkObject = filteredUserNames.map(i => {
            return {
              "username": i,
              "amount": GameDB[game].points
            };
          });
          //add points
          jebaitedAPI.addPointsBulk(jebaitedBulkObject).then(d => console.log(`Bulk Points Added! `, d)).catch(e => console.log('jebaited.addPointsBulk: ', e));
          //display info
          let res = GameDB[game].bonusMsg.replace('{amount}', filteredUserNames.length).replace('{points}', GameDB[game].points).replace('{time}', timeRange).replace('{chats}', chatMin);
          $(`#${game}LB`).append(`<div class='text fw-bold text-center'>${res}</div>`);
          if (GameDB[game].announceBonus) Game.say(res);
        });

      };
    },
    stopGame: (game) => {
      //stop game not used
    },
    gameOver: (game, data) => {
      //game over not used

    },
    menuHtml: (game) => { //Menu HTML
      return (
        `
        <form>
          <div class="form-group">
            <label class="form-label">Time Window: <span id='chatActivityTimeWindow'>?</span> minutes</label>
            <input type="range" class="form-range" min="5" max="90" value=${GAMES_SETTINGS[game].timeframe} id="chatActivityTimeWindowRange">
            <label class="form-label"># of Chats: <span id='chatActivityChatAmount'>?</span></label>
            <input type="range" class="form-range" min="1" max="50" value=${GAMES_SETTINGS[game].chatMin} id="chatActivityChatAmountRange">
          </div>
          <button id='chatActivityStartButton' class="btn btn-outline-success">Get List</button>
    	 </form>`
      )
    },
    runningHtml: (game) => { //Running HTML, add timer, lock inputs, change button
      //not used
    }
  }
};

/*
  ***********************
  BUILDER FUNCTIONS
  ***********************
*/

const Builders = {
  setActiveGame: (game) => {
    $(`#gameList div`).children(`.active:first`).removeClass('active'); //unselect old game button
    $(`#${game}Pill`).addClass('active'); //select new game button
    $(`#gameContent`).children(`.show`).removeClass('show active'); //hide old game info
    $(`#${game}Main`).addClass('show active'); //show new game info
    $('#gameList').removeClass('show');
    try {
      $(`#dropDownMenu`).html(GameDB[game].name).removeClass('show');
    } catch {
      $(`#dropDownMenu`).html("Chatters").removeClass('show');
    };
  },
  setActiveMenu: (game, target) => {
    $(`#${game}Buttons`).children(`.active:first`).removeClass('active'); //unselect old game menu/lb button
    $(`#${game + target}Button`).addClass('active'); //select new game menu/lb button
    $(`#${game}Main`).children(`.show:first`).removeClass('show active'); //hide old game mneu/lb info
    $(`#${game + target}`).addClass('show active'); //show new game menu/lb info
  },
  buildHtml: (game) => {
    $('#gameList').append(`<div><button class="btn btn-outline-info" id="${game}Pill">${GAMES_SETTINGS[game].name}</button></div>`); //Make game button
    document.getElementById(`${game}Pill`).addEventListener('click', e => { //add button listener
      e.preventDefault();
      Builders.setActiveGame(game); //change button CSS and switch to game panel
      Builders.setActiveMenu(game, `Menu`); //default to main panel
    })

    let htmlString = `
    <div id="${game}Main" class="tab-pane tab-content fade"> <!-- MAIN GAME TAB -->

    <div id='${game}Buttons' class="flex-row"> <!-- GAME'S  BUTTONS -->
        <button class="btn btn-outline-info active" id="${game}MenuButton">Main</button> <!-- MENU BUTTON -->
        <button class="btn btn-outline-info" id="${game}LBButton">Leader Board</button> <!-- LEADERBOARD BUTTON -->
   </div>

   <div id='${game}Menu' class="tab-pane fade show active"></div> <!-- MENU HTML FROM OBJECT -->
   <div id='${game}LB' class="tab-pane fade"></div> <!-- LEADERBOARD HTML FORM OBJECT -->

   </div>`

    $('#gameContent').append(htmlString); //add game container
    document.getElementById(`${game}MenuButton`).addEventListener('click', e => { //add menu button listener
      e.preventDefault();
      Builders.setActiveMenu(game, `Menu`)
    })
    document.getElementById(`${game}LBButton`).addEventListener('click', e => { //add LB button listener
      e.preventDefault();
      Builders.setActiveMenu(game, `LB`)
    })
    Builders.menuChange(game, GAMES_LOGIC[game].menuHtml(game));
    Builders.buildLeaderBoard(game);
  },
  menuChange: (game, menuHtml) => {
    $(`#${game}Menu`).html(menuHtml);
  },
  buildLeaderBoard: (game) => {

    let keysSortedByWins = Object.keys(GameDB[game].leaderboard).filter(i => GameDB[game].leaderboard[i].wins > 0).sort((a, b) => GameDB[game].leaderboard[b].wins - GameDB[game].leaderboard[a].wins).slice(0, maxLeaderboardRows), //sort leaderboard by wins; filter out game name; then grab top 10
      lastWinner = keysSortedByWins.length > 0 ? GameDB[game].leaderboard[keysSortedByWins[0]].displayName : 'Nobody'; //get last winner if there is one; or set to 'nobody'

    $(`#${game}LastWinner`).html(lastWinner); //update last winner
    let rowsHtml = keysSortedByWins.map((i, index) => { //build table rows
      return (
        `
      <tr>
        <th scope="row" class='badCSS'>#${index+1}</th>
        <td>${GameDB[game].leaderboard[i].displayName}</td>
        <td>${GameDB[game].leaderboard[i].wins}</td>
       </tr>
       `
      )
    }).join('')

    //build Table and inject table rows
    let htmlSting = `<hr><table class="table table-sm table-striped table-dark">
  <thead>
    <tr>
      <th scope="col" class='badCSS'>Rank</th>
      <th scope="col">Name</th>
      <th scope="col" id='${game}LBWinsTag'>Wins</th>
    </tr>
  </thead>
  <tbody>
    ${rowsHtml}
  </tbody>
</table>
<button id='${game}ClearLBButton' class="btn btn-outline-info">Clear Leaderboard</button>
`;
    $(`#${game}LB`).html(htmlSting); //set HTML for leaderboard

    document.getElementById(`${game}ClearLBButton`).addEventListener('click', e => { //add LB button listener
      e.preventDefault();
      verfiyClear();
    });

    function verfiyClear() {
      console.log('Clear LB for ', game);
      $(`#${game}ClearLBButton`).remove();
      $(`#${game}LB`).append(`<button id='${game}ClearLBButtonNo' class="btn btn-outline-info">GO BACK</button><button id='${game}ClearLBButtonYes' class="btn btn-danger">CLEAR</button>`);
      document.getElementById(`${game}ClearLBButtonYes`).addEventListener('click', e => { //add LB button listener
        e.preventDefault();
        GameDB[game].leaderboard = {
          "game": game
        };
        Game.saveDB().then(() => Builders.buildLeaderBoard(game)).catch();
      });
      document.getElementById(`${game}ClearLBButtonNo`).addEventListener('click', e => { //add LB button listener
        e.preventDefault();
        Builders.buildLeaderBoard(game);
      });

    };
  },
  formatTime: (seconds) => {
    let timeMin = Math.floor(seconds / 60),
      timeSec = seconds - timeMin * 60;
    return `${timeMin < 10 ? '0'+timeMin : timeMin}m:${timeSec < 10 ? '0'+timeSec : timeSec}s`;
  },
  randomizeString: (string, i = 0) => {
    i++ //same string counter
    let stringArr = string.split(' '),
      randomResult = stringArr.map(word => {
        stringSubArr = word.split('');
        for (let i = stringSubArr.length - 1; i > 0; i--) {
          let j = Math.floor(Math.random() * (i + 1)),
            tempValue = stringSubArr[i];
          stringSubArr[i] = stringSubArr[j];
          stringSubArr[j] = tempValue;
        }
        return `${stringSubArr.join(' ')}`
      });
    if (string === randomResult.join('').replace(/ /g, '') && i < 25) return Builders.randomizeString(string, i); //check if output is same as input (try 25 times, then just return) ... i.e. string = '111'.
    else return randomResult.join('⠀'); //whitespace for Twitch!
  },
  randomNumber: (min, max) => Math.floor((Math.random() * (max - min) + min)),
  filterChats: (timeFilter = 5, minMsgsSince = 1) => { //get chatters that have typed > y amount times in last x amount of time; default 5 minutes, 1
    timeFilter = Date.now() - timeFilter * 60 * 1000; //format time filter (to milliseconds)
    let userKeys = Object.keys(chatters).filter(i => chatters[i].time > timeFilter); // get users that sent a message > last time frame
    let returnObj = {}
    userKeys.forEach(i => {
      let userChats = chatters[i].activity.filter(j => j > timeFilter); //get messages within time filter
      if (userChats.length >= minMsgsSince) returnObj[i] = userChats.length; //if amount of messages > filter amount add to list with #
      else return;
    });
    return returnObj; //return obj
  }
};

function loadQuestionsDatabase() {
  const targetCells = "A:D",
    dataSource = `https://sheets.googleapis.com/v4/spreadsheets/${chatQuestionGameSetup.gSheetId}/values/${chatQuestionGameSetup.gSheetName}!${targetCells}?key=${chatQuestionGameSetup.gAPI}`;
  return new Promise((resolve, reject) => {
    fetch(dataSource)
      .then(response => response.json())
      .then(json => {
        if (json.error) throw new Error(JSON.stringify(json));
        else if (json.values.length <= 1) throw new Error('Sheet is less than 2 rows long'); //make sure that questions exist
        json.values.shift(); //remove headers
        Questions = json.values.filter(i => i[0] && i[1]); //make sure there is both a question && answer (don't add if 1 is missing)
        if (Questions.length < 1) throw new Error('No Question/Answer Pairs');
        resolve();
      })
      .catch(reject);
  });
};
//****

const Words = [
  "Bulbasaur",
  "Ivysaur",
  "Venusaur",
  "Charmander",
  "Charmeleon",
  "Charizard",
  "Squirtle",
  "Wartortle",
  "Blastoise",
  "Caterpie",
  "Metapod",
  "Butterfree",
  "Weedle",
  "Kakuna",
  "Beedrill",
  "Pidgey",
  "Pidgeotto",
  "Pidgeot",
  "Rattata",
  "Raticate",
  "Spearow",
  "Fearow",
  "Ekans",
  "Arbok",
  "Pikachu",
  "Raichu",
  "Sandshrew",
  "Sandslash",
  "Nidoran",
  "Nidorina",
  "Nidoqueen",
  "Nidorano",
  "Nidorino",
  "Nidoking",
  "Clefairy",
  "Clefable",
  "Vulpix",
  "Ninetales",
  "Jigglypuff",
  "Wigglytuff",
  "Zubat",
  "Golbat",
  "Oddish",
  "Gloom",
  "Vileplume",
  "Paras",
  "Parasect",
  "Venonat",
  "Venomoth",
  "Diglett",
  "Dugtrio",
  "Meowth",
  "Persian",
  "Psyduck",
  "Golduck",
  "Mankey",
  "Primeape",
  "Growlithe",
  "Arcanine",
  "Poliwag",
  "Poliwhirl",
  "Poliwrath",
  "Abra",
  "Kadabra",
  "Alakazam",
  "Machop",
  "Machoke",
  "Machamp",
  "Bellsprout",
  "Weepinbell",
  "Victreebel",
  "Tentacool",
  "Tentacruel",
  "Geodude",
  "Graveler",
  "Golem",
  "Ponyta",
  "Rapidash",
  "Slowpoke",
  "Slowbro",
  "Magnemite",
  "Magneton",
  "Farfetchd",
  "Doduo",
  "Dodrio",
  "Seel",
  "Dewgong",
  "Grimer",
  "Muk",
  "Shellder",
  "Cloyster",
  "Gastly",
  "Haunter",
  "Gengar",
  "Onix",
  "Drowzee",
  "Hypno",
  "Krabby",
  "Kingler",
  "Voltorb",
  "Electrode",
  "Exeggcute",
  "Exeggutor",
  "Cubone",
  "Marowak",
  "Hitmonlee",
  "Hitmonchan",
  "Lickitung",
  "Koffing",
  "Weezing",
  "Rhyhorn",
  "Rhydon",
  "Chansey",
  "Tangela",
  "Kangaskhan",
  "Horsea",
  "Seadra",
  "Goldeen",
  "Seaking",
  "Staryu",
  "Starmie",
  "Mr. Mime",
  "Scyther",
  "Jynx",
  "Electabuzz",
  "Magmar",
  "Pinsir",
  "Tauros",
  "Magikarp",
  "Gyarados",
  "Lapras",
  "Ditto",
  "Eevee",
  "Vaporeon",
  "Jolteon",
  "Flareon",
  "Porygon",
  "Omanyte",
  "Omastar",
  "Kabuto",
  "Kabutops",
  "Aerodactyl",
  "Snorlax",
  "Articuno",
  "Zapdos",
  "Moltres",
  "Dratini",
  "Dragonair",
  "Dragonite",
  "Mewtwo",
  "Mew"
];

let Questions;
