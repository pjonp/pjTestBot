const fs = require('fs'),
  path = require("path"),
  SettingsFile = path.resolve(__dirname, './SecretWordSettings.json'),
  SEAPI = require('../../util/StreamElementsAPI.js');
let settings = JSON.parse(fs.readFileSync(SettingsFile)),
    regexCheck,
    regexBuild = (secretword) => regexCheck = new RegExp(`((?<=\\s|^))(${secretword})(?!\\w)`, "i");

    regexBuild(settings.word);

module.exports = {
  settings: settings,
  main: async (TWITCHBOT, room, user, message) => {
    if(settings.subMode && !user.subscriber) return; //subMode
    console.log('reg', regexCheck);
    if (regexCheck.test(message) === false) return;
    let updateSEPoints = await SEAPI.PutPointsToSE(user.username, settings.points)
    if (!updateSEPoints) { //error saving points
      let res = {
        "type": 'whisper',
        "msg": `ERROR: Could not add ${settings.points} points to ${user.username}'s StreamElements account.`
      };
      return BotResponse(TWITCHBOT, room, settings.editors[0], res);
    } else {
      let res = {
        "type": 'action',
        "msg": `${user.username} has found ${settings.points} points by unlocking the secret "${settings.word}" word chest!`
      };
      settings.enabled = false;
      BotResponse(TWITCHBOT, room, user.username, res);
      return SaveSettings(TWITCHBOT, room, user.username);
    };
  },
  update: async (TWITCHBOT, room, user, message) => {
    if (!settings.editors.some(i => i === user.username)) return;
    let msgA = message.toLowerCase().split(' '),
      res = {
        "type": 'whisper',
        "msg": ``,
        "error": false
      };
    msgA.shift();
    switch (msgA[0]) {
      case 'word':
        if (!msgA[1]) {
          res.msg = `Error: ${settings.chatCommand} word <TRIGGERWORD>`;
          res.error = true;
        } else {
          settings.word = msgA[1];
          regexBuild(settings.word);
      //    regexCheck = new RegExp(`(?<=\\s)(${settings.word})(?!\\w)`, "i");
          res.msg = `Secret word has been set to: ${settings.word}`
        }
        break;
      case 'enabled':
        if (msgA[1] === 'true' || msgA[1] === 'false') {
          settings.enabled = (msgA[1] === 'true');
          res.msg = `Secret Word has been: ${settings.enabled ? 'ENABLED!' : 'DISABLED!'}`;
        } else {
          res.msg = `Error: ${settings.chatCommand} enabled < true | false >`;
          res.error = true;
        }
        break;
      case 'submode':
        if (msgA[1] === 'true' || msgA[1] === 'false') {
          settings.subMode = (msgA[1] === 'true');
          res.msg = `Secret Word SUBMODE has been: ${settings.subMode ? 'ENABLED!' : 'DISABLED!'}`
        } else {
          res.msg = `Error: ${settings.chatCommand} submode < true | false >`;
          res.error = true;
        }
        break;
      case 'points':
        if (parseInt(msgA[1]) > 0) {
          settings.points = parseInt(msgA[1]);
          res.msg = `Secret Word POINT BONUS has been set to: ${settings.points}`
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
        let target = settings.editors.findIndex(i => i === msgA[1])
        if (target < 0) {
          res.msg = `Error: ${msgA[1]} is not an editor! Current editors are: ${settings.editors}`;
          res.error = true;
        } else if (target === 0) {
          res.msg = `Error: ${msgA[1]} is the OWNER and cannot be removed! Current editors are: ${settings.editors}`;
          res.error = true;
        } else {
          settings.editors.splice(target, 1)
          res.msg = `${msgA[1]} was removed as an editor! Current editors are: ${settings.editors}`;
        }
        break;
      case 'settings':
        res.msg = `word: ${settings.word} | enabled: ${settings.enabled} | submode: ${settings.subMode} | points: ${settings.points} | editors: ${settings.editors}`;
        res.error = true
        break;
      default:
        res.msg = `Setting Options: ${settings.chatCommand} < word | enabled | submode | points | editoradd | editorremove | settings >`;
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
    res.msg = `Secret Word Settings File Saved!`
    console.log(res.msg);
  } catch {
    res.msg = `!!!! Error Saving Secret Word Settings File`
    console.error(res.msg);
    res.error = true;
  };
  return BotResponse(TWITCHBOT, room, username, res);
};

const BotResponse = (TWITCHBOT, room, username, res) => {
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
