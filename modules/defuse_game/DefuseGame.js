const fs = require('fs'),
  path = require("path"),
  SettingsFile = path.resolve(__dirname, './DefuseGameSettings.json'), //EDIT FOR SETTINGS FILE
  SEAPI = require('../../util/StreamElementsAPI.js'); //IMPORT S.E. FUNCTIONS
let settings = JSON.parse(fs.readFileSync(SettingsFile)), //LOAD SETTINGS
  onCooldown = false, //not used
  cooldownUsers = []; //not used

module.exports = {
  settings: settings,
  main: async (TWITCHBOT, room, user, message) => { //MAIN GAME LOGIC
    if (settings.subMode && !user.subscriber) return; //subMode
    if (onCooldown) return; //cooldown

    //LOGIC HERE
    let msgA = message.toLowerCase().split(' '), //message to array
      res = {};
    msgA.shift(); //REMOVE COMMAND FROM MESSAGE
    if (!settings.wires.some(i => i === msgA[0])) { //if INVALID wire
      res.type = 'action';
      res.msg = `There is no ${msgA[0]} wire ${user.username} :thinking: Wires are: ${settings.wires}`
    } else {
      let randomWire = settings.wires[Math.floor(Math.random() * settings.wires.length)], //pick a random wire from the settings
        winner = msgA[0] === randomWire, //true/false; does the randomWire = the users guess?
        points = winner ? settings.pointsAdd : settings.pointsRemove, //if user is a winner set points to add, if lost set to remove
        updateSEPoints = await SEAPI.PutPointsToSE(user.username, points); //TRY TO SAVE POINTS
      //END LOGIC

      if (!updateSEPoints) { //IF THERE WAS AN ERROR SAVING POINTS
        res.type = 'whisper'; //TYPE: say/action/whisper: set to whsip owner on error
        res.msg = `ERROR (${settings.chatCommand}): Could not add/remove ${points} points to ${user.username}'s StreamElements account.`;
        res.error = true;
      } else { //POINTS SAVED SUCCESSFULLY
        onCooldown = true; //enable cooldown
        setTimeout(() => { onCooldown = false }, 5000) //5 second cooldown
        if (winner) { //if winner
          res.type = 'action';
          res.msg = `You cut the correct wire ${user.username}! You've gained ${points} points!`;
        } else { // if lost
          res.type = 'action';
          res.msg = `You cut the wrong wire ${user.username} :( You've lost ${Math.abs(points)} points!`;
        };
      };
    };
    if (res.error) {
      console.log(res.msg);
    };
    return BotResponse(TWITCHBOT, room, settings.editors[0], res); //SEND WHSIPER TO OWNER ON ERROR
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
      case 'enabled': //!defuse enabled ...
        if (msgA[1] === 'true' || msgA[1] === 'false') { //force true/false after enabled
          settings.enabled = (msgA[1] === 'true');
          res.msg = `Defuse Game has been: ${settings.enabled ? 'ENABLED!' : 'DISABLED!'}`;
        } else {
          res.msg = `Error: ${settings.chatCommand} enabled < true | false >`; //error check
          res.error = true;
        }
        break;
      case 'submode': //!defuse submode ....
        if (msgA[1] === 'true' || msgA[1] === 'false') {
          settings.subMode = (msgA[1] === 'true');
          res.msg = `Defuse Game SUBMODE has been: ${settings.subMode ? 'ENABLED!' : 'DISABLED!'}`
        } else {
          res.msg = `Error: ${settings.chatCommand} submode < true | false >`;
          res.error = true;
        }
        break;
      case 'pointsadd': //!defuse pointsadd ....
        if (parseInt(msgA[1]) > 0) { //require a number > 0 for
          settings.pointsAdd = parseInt(msgA[1]);
          res.msg = `Defuse Game POINT BONUS has been set to: ${settings.pointsAdd}`
        } else {
          res.msg = `Error: ${settings.chatCommand} points <NUMBER>`;
          res.error = true;
        }
        break;
      case 'pointsremove': //!defuse pointsremove ....
        if (parseInt(msgA[1]) <= 0) { //require a number <= 0
          settings.pointsRemove = parseInt(msgA[1]);
          res.msg = `Defuse Game POINT REMOVAL has been set to: ${settings.pointsRemove}`
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
        case 'wireadd':
          if (!msgA[1]) {
            res.msg = `Error: ${settings.chatCommand} wireadd <COLOR>`;
            res.error = true;
          } else if (settings.wires.findIndex(i => i === msgA[1]) >= 0) {
            res.msg = `Error: ${msgA[1]} is already a wire!`;
            res.error = true;
          } else {
            settings.wires.push(msgA[1])
            res.msg = `${msgA[1]} added as a wire! Current wires are: ${settings.wires}`;
          }
          break;
        case 'wireremove':
          if (!msgA[1]) {
            res.msg = `Error: ${settings.chatCommand} wireremove <COLOR>`;
            res.error = true;
            break;
          }
          let targetWire = settings.wires.findIndex(i => i === msgA[1])
          if (targetWire < 0) {
            res.msg = `Error: ${msgA[1]} is not a wire! Current wires are: ${settings.wires}`;
            res.error = true;
          } else if (targetWire === 0) {
            res.msg = `Error: ${msgA[1]} is the MAIN and cannot be removed! Current wires are: ${settings.wires}`;
            res.error = true;
          } else {
            settings.wires.splice(targetWire, 1)
            res.msg = `${msgA[1]} was removed as a wire! Current wires are: ${settings.wires}`;
          }
          break;
        case 'settings':
          res.msg = `enabled: ${settings.enabled} | submode: ${settings.subMode} | pointsadd: ${settings.pointsAdd} | pointsremove: ${settings.pointsRemove} | wires: ${settings.wires} | editors: ${settings.editors}`;
          res.error = true
          break;
        default:
          res.msg = `Setting Options: ${settings.chatCommand} < enabled | submode | pointsadd | pointsremove | wireadd | wireremove | editoradd | editorremove | settings >`;
          res.error = true;
    }
    BotResponse(TWITCHBOT, room, user.username, res);
    if (res.error) return;
    return SaveSettings(TWITCHBOT, room, user.username);
  }
};

const SaveSettings = (TWITCHBOT, room, username) => {
  let res = {
    "type": 'whisper', //"say", "action" or "whisper"
    "msg": ``,
  };
  try {
    fs.writeFileSync(SettingsFile, JSON.stringify(settings, null, 2), "utf8");
    res.msg = `Defuse Game Settings File Saved!` //EDIT FOR MODULE
    console.log(res.msg);
  } catch {
    res.msg = `!!!! Error Saving Defuse Game Settings File` //EDIT FOR MODULE
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
