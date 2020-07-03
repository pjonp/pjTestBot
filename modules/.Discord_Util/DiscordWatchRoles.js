const fetch = require('node-fetch'),
  fs = require('fs'),
  path = require("path"),
  SettingsFile = path.resolve(process.cwd(), './.settings/DiscordWatchRolesSettings.json'),
  settings = JSON.parse(fs.readFileSync(SettingsFile)),
  SEAPI = require('../../util/StreamElementsAPI.js'),
  TwitchAPI = require('../../util/TwitchAPI.js'),
  WebsiteAPI = require('../../util/WebsiteAPI.js');

let hourTier,
  statusMsg,
  running = false;

settings.hourTiers.sort((a, b) => a.minutes - b.minutes);
hourTier = [...settings.hourTiers];
if (settings.highToLow) {
  hourTier = [...settings.hourTiers.reverse()]
  settings.hourTiers.reverse()
};

module.exports = {
  chatCommand: settings.chatCommand,
  about: settings.about,
  main: async (message) => {
    if (!message.member.hasPermission('MANAGE_ROLES') || running) return;
    running = true;

    statusMsg = await discordSend(message, settings.thinkingMsg, false).catch();
    /*
    await message.delete().then(() => {
      message.channel.send('...counting 🧮 🤔').then(msg => statusMsg = msg);
    }).catch(error => console.error(error, '!!11Error cycling Discord "Watch Roles" status message ^^^ ....'));
    */

    const getUserMinutes = await SEAPI.GetMinutesFromSE(),
      userObj = settings.hourTiers.map((i, index, tiers) => {
        return {
          tier: index,
          users: getUserMinutes.users.filter(j => {
            if (index === tiers.length - 1 && j.minutes >= i.minutes) return true;
            else if (j.minutes >= i.minutes && j.minutes < tiers[index + 1].minutes) return true;
            else return false;
          })
        };
      }).map(i => {
        return {
          tier: i.tier,
          users: i.users.map(j => j.username)
        };
      });
    if (settings.highToLow) userObj.reverse();

    if (!getUserMinutes) { //error getting points.
      BotResponse(message, "Error: I can't read StreamElements Watch Time!");
      running = false;
      return;
    } else {
      let tierLoop = async (tier) => {
        if (userObj.length === tier) {
          //  await statusMsg.delete().catch(error => console.error(error, '!!Error deleting Discord "Watch Roles" #1 message ^^^ ....'));
          statusMsg = await discordSend(statusMsg, settings.doneMsg, true).catch();
          running = false;
          return;
        };
        await setWatchRoles(message, userObj[tier].users, tier).then(async res => {
          let fields = res.filter(i => i.value);
          if (fields[0]) {
            //    await statusMsg.delete().catch(error => console.error(error, '!!Error deleting Discord "Watch Roles" #2 message ^^^ ....'));
            const embed = {
              "color": hourTier[tier].color,
              "timestamp": new Date(),
              "footer": {
                "text": '¯\\_(ツ)_/¯'
              },
              "thumbnail": {
                "url": hourTier[tier].img
              },
              "author": {
                "name": hourTier[tier].msg
              },
              "fields": fields
            };
            BotResponse(message, {
              embed
            });
            if (userObj.length !== tier - 1) {
              statusMsg = await discordSend(statusMsg, settings.thinkingMsg, false).catch();
            };
            //    await message.channel.send('...counting 🧮 🤔').then(msg => statusMsg = msg).catch(error => console.error(error, '!!Error cycling Discord "Watch Roles" status message #3 ^^^ ....'));
          };
          tier++
          tierLoop(tier);
        }).catch(e => console.error(e, '!!!something went bad (setWatchRoles) ^^^...'))
      };
      tierLoop(0);
    };
  }
}; //end exports

const setWatchRoles = (message, users, tier) => {
  let res = [{
      "name": "Role Added:",
      "value": ''
    },
    {
      "name": "No Discord Connection:",
      "value": ''
    },
    {
      "name": "No Twich Connection:",
      "value": ''
    },
    {
      "name": "API Error:",
      "value": ''
    }
  ];
  return new Promise((resolve, reject) => {
    const userLoop = (index) => {
      if (index === users.length) {
        resolve(res);
        return;
      };
      //get twitch id from username
      let username = users[index];
      TwitchAPI.getTwitchID(username).then(Tdata => {
        if (!Tdata.error) {
          let t_id;
          try {
            t_id = Tdata.data[0].id;
          } catch (err) {
            console.log(err, 'User Deleted?? ^^ ... moving on...');
            res[3].value += checkMaxString(res[3].value, username);
            index++;
            setTimeout(() => {
              userLoop(index)
            }, 525)
            return;
          };
          //get discord id from twitch ID
          WebsiteAPI.getDiscordID(t_id).then(Ddata => {
            if (Ddata && !Ddata.error) {
              let roles = hourTier.map(i => i.roleID);
              //remove any time roles & add new tier
              message.guild.member(Ddata.d_id).roles.remove(roles)
                .then(message.guild.member(Ddata.d_id).roles.add(hourTier[tier].roleID))
                .catch(e => console.error(e, '!!!Error Adding Discord Role ^^'));
              res[0].value += checkMaxString(res[0].value, username);
            } else if (Ddata.error) {
              Ddata.error === 'User Not Found' ? res[2].value += checkMaxString(res[2].value, username) : res[1].value += checkMaxString(res[1].value, username);
            } else {
              res[3].value += checkMaxString(res[3].value, username);
            };
            index++;
            setTimeout(() => {
              userLoop(index)
            }, 525)
          }).catch( () => {
            console.log('!!!Twitch Watch Points Website API Error? ^^...');
            res[3].value += checkMaxString(res[3].value, username);
            index++;
            setTimeout(() => {
              userLoop(index)
            }, 525)
          });;
        } else {
          console.log('!!!Twitch Watch Time Error?: ' + Tdata.error);
          res[3].value += checkMaxString(res[3].value, username);
          index++;
          setTimeout(() => {
            userLoop(index)
          }, 525)
        };
      }).catch(e => console.error(e, '!!!Something Went Bad (setWatchRoles)^^...'));
    };
    userLoop(0);
  });
};

const checkMaxString = (resString, username) => {
  if (resString.length < 1005) {
    return `${username}\n`;
  } else {
    return resString.includes('...') ? '' : '...';
  };

};

const BotResponse = (message, res) => {
  message.channel.send(res).catch(err => console.error(err, '!!!Error Sending Discord Message ^^'));
  return;
};

const discordSend = (messageObj, res, remove) => {
  return new Promise((resolve, reject) => {
    messageObj.delete()
      .then(() => messageObj.channel.send(res)
        .then(msg => {
          if (remove) msg.delete({
            timeout: 5000
          });
          resolve(msg);
        }))
      .catch(e => {
        console.error(e, '!!SE From Discord: Discord send error^^^ ....')
        reject();
      });
  });
};
