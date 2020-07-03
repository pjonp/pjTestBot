const TWITCHBOT = require('../../pjtestbot.js').TWITCHBOT,
fs = require('fs'),
path = require("path"),
SettingsFile = path.resolve(process.cwd(), './.settings/seFromDiscordSettings.json'),
settings = JSON.parse(fs.readFileSync(SettingsFile));

let messageGlobalObject, discordMsg, discordMsgSender, timer, running = false;

settings.seNoParamNonModCommands.forEach(i => {
  settings.seCommands.push({
    "command": i,
    "params": []
  });
});
module.exports = {
  chatCommand: "S.E. Twitch Commands Available:",
  about: settings.seCommands.map(i => `${i.command} ${i.params.join(' ')}`.trim()).join('\n'),
  subCommands: settings.seCommands,
  main: (messageObj, commandObj) => {
    if (running) return;
    discordMsg = messageObj.cleanContent.replace('@', '');
    discordMsgSender = messageObj.member.displayName;
    if (commandObj.modCmd && !messageObj.member.hasPermission('MANAGE_ROLES')) {
      const embed = {
        "description": `Error: ${commandObj.command} requires 'MANAGE_ROLES' Discord permission`,
        "color": 13632027,
        "author": {
          "name": discordMsg,
          "icon_url": settings.discordIcon
        }
      };
      discordSend(messageObj, {
        embed
      }, true).catch(e => console.error(e, '!! seFromDiscord role warning error?? ^^^....'));
      return;
    } else if (commandObj.params.length >= discordMsg.split(' ').length) {
      const embed = {
        "description": `Format Error: ${commandObj.command} ${commandObj.params.join(' ')}`.trim(),
        "color": 13632027,
        "author": {
          "name": discordMsg,
          "icon_url": settings.discordIcon
        }
      };
      discordSend(messageObj, {
        embed
      }, true).catch(e => console.error(e, '!! seFromDiscord format warning error?? ^^^....'));
      return;
    } else {

      running = true;
      process.env.WAITINGFORTWITCHCOMMAND = 'true';
      messageGlobalObject = messageObj;

      TWITCHBOT.say(process.env.T_CHANNELNAME, discordMsg).catch(e => console.error(e, '!!SE From Discord: Twitch say error^^^ ....'));

      timer = setTimeout(() => {
        process.env.WAITINGFORTWITCHCOMMAND = 'false';
        running = false;
        messageGlobalObject = null;
        const embed = {
          "description": `No Reponse ¯\\_(ツ)_/¯ From StreamElements`,
          "color": 13632027,
          "author": {
            "name": discordMsg,
            "icon_url": settings.discordIcon
          }
        };
        discordSend(messageObj, {
          embed
        }, true).catch();
      }, 2000); // 2 seconds for bot to respond
    };
  },
  response: (user, message, self) => {
    if (message !== discordMsg && (user.username === process.env.T_BOTUSERNAME || user.username === 'streamelements')) {
      const embed = {
        "description": message.toLowerCase().replace(`@${process.env.T_BOTUSERNAME}, `, '').replace(process.env.T_BOTUSERNAME, discordMsgSender),
        "color": 4886754,
        "author": {
          "name": discordMsg,
          "icon_url": settings.discordIcon
        }
      };
      discordSend(messageGlobalObject, {
        embed
      }, false).then(() => {
        clearTimeout(timer);
        process.env.WAITINGFORTWITCHCOMMAND = 'false';
        running = false;
      }).catch(e => console.error(e))
    };
  } //end response
}; //end exports

const discordSend = (messageObj, res, remove) => {
  return new Promise((resolve, reject) => {
    messageObj.delete()
      .then(() => messageObj.channel.send(res)
        .then(msg => {
          if (remove) msg.delete({
            timeout: 10000
          });
          resolve(msg);
        }))
      .catch(e => {
        console.error(e, '!!SE From Discord: Discord send error^^^ ....')
        reject();
      });
  });
};
