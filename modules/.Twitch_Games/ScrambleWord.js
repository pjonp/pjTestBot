const fs = require('fs'),
  path = require("path"),
  SettingsFile = path.resolve(process.cwd(), './.settings/ScrambleWordSettings.json'),
  SEAPI = require('../../util/StreamElementsAPI.js'),
  Words = require('./ScrambleWordDatabase.json');
let settings = JSON.parse(fs.readFileSync(SettingsFile)),
  regexCheck,
  regexBuild = (word) => regexCheck = new RegExp(`((?<=\\s|^))(${word})(?!\\w)`, "i"),
  randomTime = () => Math.floor((Math.random() * (settings.randomTimeMax - settings.randomTimeMin) + settings.randomTimeMin)),
  randomPoints = () => Math.floor((Math.random() * (settings.pointsMax - settings.pointsMin) + settings.pointsMin)),
  randomGameTimer,
  winnerPoints = randomPoints();

regexBuild(settings.word);

module.exports = {
  settings: settings,
  main: async (TWITCHBOT, room, user, message) => {
    if (settings.enabled === false || (settings.subMode && !user.subscriber)) return;
    if (regexCheck.test(message) === false) return;
    let res = {
      type: 'action',
      msg: `${user.username} PorscheWIN ${winnerPoints}HP for decoding ${settings.word}!`
    };
    settings.enabled = false;
    BotResponse(TWITCHBOT, room, user.username, res);
    let updateSEPoints = await SEAPI.PutPointsToSE(user.username, winnerPoints);
    if (!updateSEPoints) { //error saving points
      res.type = 'whisper';
      res.msg = `***ERROR: (${settings.chatCommand}): Could not add ${winnerPoints} points to ${user.username}'s StreamElements account.`;
      console.log(res.msg);
      BotResponse(TWITCHBOT, room, settings.editors[0], res);
    };
    if (settings.loopGames) randomGame(TWITCHBOT, room);
    return;
  },
  online: (TWITCHBOT, room) => {
    if (!settings.autoStart) return;
    settings.enabled = true;
    clearTimeout(randomGameTimer);
    randomGame(TWITCHBOT, room);
  },
  offline: () => {
    settings.enabled = false;
    clearTimeout(randomGameTimer);
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
          msgA.shift();
          settings.word = msgA.join(' ');
          settings.enabled = true;
          clearTimeout(randomGameTimer);
          regexBuild(settings.word);
          winnerPoints = randomPoints();
          res.msg = `Scramble Word has been set to: ${settings.word} | GAME STARTED!`;
          BotResponse(TWITCHBOT, settings.editors[0], user.username, {
            type: 'action',
            msg: `PogChamp Unscramble me:`
          });
          BotResponse(TWITCHBOT, settings.editors[0], user.username, {
            type: 'action',
            msg: `${randomizeString(settings.word.toUpperCase())}`
          });
        }
        break;
      case 'enabled':
        if (msgA[1] === 'true' || msgA[1] === 'false') {
          settings.enabled = (msgA[1] === 'true');
          clearTimeout(randomGameTimer);
          res.msg = `Scramble Word has been: ${settings.enabled ? 'ENABLED!' : 'DISABLED!'}`;
          if (settings.enabled) {
            BotResponse(TWITCHBOT, settings.editors[0], user.username, {
              type: 'action',
              msg: `PogChamp Unscramble me:`
            });
            BotResponse(TWITCHBOT, settings.editors[0], user.username, {
              type: 'action',
              msg: `${randomizeString(settings.word.toUpperCase())}`
            });
          };
        } else {
          res.msg = `Error: ${settings.chatCommand} enabled < true | false >`;
          res.error = true;
        }
        break;
      case 'submode':
        if (msgA[1] === 'true' || msgA[1] === 'false') {
          settings.subMode = (msgA[1] === 'true');
          res.msg = `Scramble Word SUBMODE has been: ${settings.subMode ? 'ENABLED!' : 'DISABLED!'}`
        } else {
          res.msg = `Error: ${settings.chatCommand} submode < true | false >`;
          res.error = true;
        }
        break;
      case 'pointsmin':
          if (parseInt(msgA[1]) > 0) {
            settings.pointsMin = parseInt(msgA[1]);
            res.msg = `Scramble Word POINT MIN has been set to: ${settings.pointsMin}`
          } else {
            res.msg = `Error: ${settings.chatCommand} pointsmin <NUMBER>`;
            res.error = true;
          }
          break;
          case 'pointsmax':
            if (parseInt(msgA[1]) > 0) {
              settings.pointsMax = parseInt(msgA[1]);
              res.msg = `Scramble Word POINT MAX has been set to: ${settings.pointsMax}`
            } else {
              res.msg = `Error: ${settings.chatCommand} pointsmax <NUMBER>`;
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
        break;
      case 'loopgames':
        if (msgA[1] === 'true' || msgA[1] === 'false') {
          settings.loopGames = (msgA[1] === 'true');
          res.msg = `Scramble Word LOOPGAMES has been: ${settings.loopGames ? 'ENABLED!' : 'DISABLED!'}`
        } else {
          res.msg = `Error: ${settings.chatCommand} loopgames < true | false >`;
          res.error = true;
        }
        break;
      case 'autostart':
        if (msgA[1] === 'true' || msgA[1] === 'false') {
          settings.autoStart = (msgA[1] === 'true');
          res.msg = `Scramble Word AUTOSTART has been: ${settings.autoStart ? 'ENABLED!' : 'DISABLED!'}`
        } else {
          res.msg = `Error: ${settings.chatCommand} autostart < true | false >`;
          res.error = true;
        }
        break;
      case 'settings':
        res.msg = `word: ${settings.word} | enabled: ${settings.enabled} | submode: ${settings.subMode} | autostart: ${settings.autoStart} | loopgames: ${settings.loopGames} | pointsmin: ${settings.pointsMin} | pointsmax: ${settings.pointsMax} | editors: ${settings.editors}`;
        res.error = true
        break;
      default:
        res.msg = `Setting Options: ${settings.chatCommand} < word | enabled | submode | pointsmin | pointsmax | autostart | loopgames | editoradd | editorremove | settings >`;
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
    res.msg = `Scramble Word Settings File Saved!`
    console.log(res.msg);
  } catch {
    res.msg = `!!!! Error Saving Scramble Word Settings File`
    console.error(res.msg);
    res.error = true;
  };
  if (res.error) BotResponse(TWITCHBOT, room, username, res);
  return;
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

const randomGame = (TWITCHBOT, room) => {
  randomGameTimer = setTimeout(() => {
    let randWord = Words[Math.floor(Math.random() * Words.length)],
      message = `${settings.chatCommand} word ${randWord}`,
      user = {
        username: settings.editors[0]
      };
    module.exports.update(TWITCHBOT, room, user, message);
  }, randomTime() * 1000);

};

const randomizeString = (string) => {
  let stringArr = string.split(' '),
  randomResult = stringArr.map(word => {
    stringSubArr = word.split('');
    for(let i = stringSubArr.length-1; i > 0; i--) {
       let j = Math.floor(Math.random() * (i + 1)),
        tempValue = stringSubArr[i];
       stringSubArr[i] = stringSubArr[j];
       stringSubArr[j] = tempValue;
   }
   return `[${stringSubArr.join(',')}]`
  })
  return randomResult.join('⠀');//whitespace for Twitch!
};
