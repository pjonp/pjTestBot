const fs = require('fs'),
  path = require("path"),
  SettingsFile = path.resolve(__dirname, './RevealGameSettings.json'), //EDIT FOR SETTINGS FILE
  SEAPI = require('../../util/StreamElementsAPI.js'), //IMPORT S.E. FUNCTIONS
  SE_OVERLAYS = require('../../pjtestbot.js').SE_OVERLAYS,
  GAMEDATA = require('./assets/pokemon.json-master/pokedex.json')
let settings = JSON.parse(fs.readFileSync(SettingsFile)), //LOAD SETTINGS
  answer = '',
  gameTimeLimitTimer;

module.exports = {
  settings: settings,
  main: async (TWITCHBOT, room, user, message) => { //MAIN GAME LOGIC
    if (settings.subMode && !user.subscriber) return; //subMode
    let msgA = message.toLowerCase().split(' '), //message to array
      res = {};
    msgA.shift(); //REMOVE COMMAND FROM MESSAGE
    console.log('answer:', answer.toLowerCase());
    if (msgA[0] === answer.toLowerCase()) {

      updateSEPoints = await SEAPI.PutPointsToSE(user.username, settings.points); //TRY TO SAVE POINTS

      if (!updateSEPoints) { //IF THERE WAS AN ERROR SAVING POINTS
        res.type = 'whisper'; //TYPE: say/action/whisper: set to whsip owner on error
        res.msg = `ERROR (${settings.chatCommand}): Could not add/remove ${points} points to ${user.username}'s StreamElements account.`;
        res.error = true;
      };
      if (res.error) {
        console.log(res.msg);
      };
      res = endRevealGame(user.username)
      return BotResponse(TWITCHBOT, room, settings.editors[0], res); //SEND WHSIPER TO OWNER ON ERROR
    } else {
      return;
    };
  },
  update: async (TWITCHBOT, room, user, message) => { //GAME UPDATE COMMANDS
    if (!settings.editors.some(i => i === user.username)) return; //MUST BE A GAME EDITOR
    let msgA = message.toLowerCase().split(' '), //message to array
      res = {
        "type": 'whisper',
        "msg": ``,
        "error": false
      };
    msgA.shift(); //REMOVE COMMAND
    switch (msgA[0]) {
      case 'start': //!defuse enabled ...
        if (settings.running) { //force true/false after enabled
          res.msg = `Error: ${settings.chatCommand} is already running!`; //error check
          res.error = true;
        } else {
          res.msg = await startRevealGame(); //START A GAME
          res.error = true; //dont need to save settings
        }
        break;
      case 'stop': //!defuse enabled ...
        if (settings.running) { //force true/false after enabled
      //    settings.running = false;
          res.msg = await endRevealGame(); //END THE GAME
          res.error = true; //dont need to save settings
        } else {
          res.msg = `Error: ${settings.chatCommand} is not running!`; //error check
          res.error = true;
        }
        break;
      case 'submode': //!defuse submode ....
        if (msgA[1] === 'true' || msgA[1] === 'false') {
          settings.subMode = (msgA[1] === 'true');
          res.msg = `Reveal Game SUBMODE has been: ${settings.subMode ? 'ENABLED!' : 'DISABLED!'}`
        } else {
          res.msg = `Error: ${settings.chatCommand} submode < true | false >`;
          res.error = true;
        }
        break;
      case 'points':
        if (parseInt(msgA[1]) > 0) { //require a number > 0 for
          settings.pointsAdd = parseInt(msgA[1]);
          res.msg = `Reveal Game POINT BONUS has been set to: ${settings.pointsAdd}`
        } else {
          res.msg = `Error: ${settings.chatCommand} points <NUMBER>`;
          res.error = true;
        }
        break;
      case 'editoradd':
        if (!msgA[1]) {
          res.msg = `Error: ${settings.chatCommand} editoradd <USERNAME>`;
          res.error = true;
        } else if (settings.editors.findIndex(i => i === msgA[1]) >= 0) {
          res.msg = `Error: ${msgA[1]} is already an editor!`;
          res.error = true;
        } else {
          settings.editors.push(msgA[1])
          res.msg = `${msgA[1]} was added as an editor! Current editors are: ${settings.editors}`;
        }
        break;
      case 'editorremove':
        if (!msgA[1]) {
          res.msg = `Error: ${settings.chatCommand} editorremove <USERNAME>`;
          res.error = true;
          break;
        }
        let targetEditor = settings.editors.findIndex(i => i === msgA[1])
        if (targetEditor < 0) {
          res.msg = `Error: ${msgA[1]} is not an editor! Current editors are: ${settings.editors}`;
          res.error = true;
        } else if (targetEditor === 0) {
          res.msg = `Error: ${msgA[1]} is the OWNER and cannot be removed! Current editors are: ${settings.editors}`;
          res.error = true;
        } else {
          settings.editors.splice(targetEditor, 1)
          res.msg = `${msgA[1]} was removed as an editor! Current editors are: ${settings.editors}`;
        }
        case 'settings':
          res.msg = `running: ${settings.running} | submode: ${settings.subMode} | points: ${settings.pointsAdd} | editors: ${settings.editors}`;
          res.error = true
          break;
        default:
          res.msg = `Setting Options: ${settings.chatCommand} < start | stop | submode | points | editoradd | editorremove | settings >`;
          res.error = true;
    }
    BotResponse(TWITCHBOT, room, user.username, res);
    if (res.error) return;
    return SaveSettings(TWITCHBOT, room, user.username);
  }
};

const startRevealGame = () => {
  let randAnswer = GAMEDATA[Math.floor(Math.random() * GAMEDATA.length)],
      num = randAnswer.id < 10 ? '00' + randAnswer.id : randAnswer.id < 100 ? '0' + randAnswer.id : randAnswer.id;

      answer = randAnswer.name.english;
      settings.running = true;

      gameTimeLimitTimer = setTimeout( () => {
          endRevealGame();
      }, ((2*settings.gameStartDelay)+(settings.gridSize*settings.gridSize*settings.roundDelay))*1000 );

      SE_OVERLAYS.emit('revealGameStart', {
        gridSize: settings.gridSize,
        gameStartDelay: settings.gameStartDelay,
        roundDelay: settings.roundDelay,
        num: num
      });

      return `Reveal Game has started!`;
};

const endRevealGame = (winner) => {
  let res = {
    type: 'action',
    msg: `${answer} is correct ${winner}! You've won ${settings.points} points!`
  };

  clearTimeout(gameTimeLimitTimer);
  settings.running = false;

  SE_OVERLAYS.emit('revealGameStop', {
    answer: answer,
    winner: winner
  });

  return winner ? res : `Reveal Game has been stopped!`;
};


const SaveSettings = (TWITCHBOT, room, username) => {
  let res = {
    "type": 'whisper', //"say", "action" or "whisper"
    "msg": ``,
  };
  try {
    fs.writeFileSync(SettingsFile, JSON.stringify(settings, null, 2), "utf8");
    res.msg = `Reveal Game Settings File Saved!` //EDIT FOR MODULE
    console.log(res.msg);
  } catch {
    res.msg = `!!!! Error Saving Reveal Game Settings File` //EDIT FOR MODULE
    console.error(res.msg);
    res.error = true;
  };
  return BotResponse(TWITCHBOT, room, username, res);
};

const BotResponse = (TWITCHBOT, room, username, res) => { //BOT RESPONSE. Don't need to edit this
  if (res.type === 'whisper') {
    TWITCHBOT.whisper(username, res.msg).catch((err) => {
      console.log(err)
    });
  } else if (res.type === 'action') {
    TWITCHBOT.action(room, res.msg).catch((err) => {
      console.log(err)
    });
  } else {
    TWITCHBOT.say(room, res.msg).catch((err) => {
      console.log(err)
    });
  };
  return res;
};
