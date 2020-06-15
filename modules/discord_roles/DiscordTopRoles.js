const fetch = require('node-fetch'),
  fs = require('fs'),
  path = require("path"),
  SettingsFile = path.resolve(process.cwd(), './.settings/DiscordTopRolesSettings.json'),
  settings = JSON.parse(fs.readFileSync(SettingsFile)),
  SEAPI = require('../../util/StreamElementsAPI.js'),
  TwitchAPI = require('../../util/TwitchAPI.js'),
  WebsiteAPI = require('../../util/WebsiteAPI.js');

let running = false,
  statusMsg;

module.exports = {
  chatCommand: settings.chatCommand,
  about: settings.about,
  main: async (message) => {
    if (running) return
    else if (!message.member.hasPermission('MANAGE_ROLES')) {
      const embed = {
        "description": `Error: ${settings.chatCommand} requires 'MANAGE_ROLES' Discord permission`,
        "color": 13632027,
        "author": {
          "name": message.cleanContent,
          "icon_url": settings.discordIcon
        }
      };
      BotResponse(message, {
        embed
      }, true).catch();
      return;
    };

    running = true;

    statusMsg = await discordSend(message, '...counting 🧮 🤔', false).catch();
    settings.pointTiers.forEach(i => {
      message.guild.roles.fetch(i.roleID)
        .then(role => role.members.each(gMember => {
          gMember.roles.remove(i.roleID)
        }))
        .catch(e => console.error(e, '!!!Error Removing Discord Roles ^^^'));
    });

    let getTopPoints = await SEAPI.GetTopPointsFromSE(settings.pointTiers.length); //settings.pointTiers.length);
    if (!getTopPoints) { //error getting points.
      BotResponse(message, "Error: I can't read StreamElements Points!");
    } else {
      await setTopPointRoles(message, getTopPoints.users).then(res => {
        //  console.log('FINAL:', res);
        res.forEach((i, index) => {
          const embed = {
            "description": `**${i.username}**`,
            "color": i.color,
            "timestamp": new Date(),
            "footer": {
              "text": i.status
            },
            "thumbnail": {
              "url": i.img
            },
            "author": {
              "name": i.msg
            }
          };
          BotResponse(message, {
            embed
          });
          if (index === res.length - 1) {
            running = false;
            statusMsg.delete().catch(e => e, '!!!Error Removing Discord Top Roles status message ^^...')
          };
        });
      }).catch(e => console.error(e, '!!!something went bad (setTopPointRoles)^^^...'));
    };
  }
}; //end exports

const setTopPointRoles = (message, users) => {
  let res = [];
  return new Promise((resolve, reject) => {
    const userLoop = (index) => {
      if (index === users.length) {
        resolve(res.sort());
        return;
      };
      //get twitch id from username
      let user = users[index],
        resObj = {
          rank: index + 1,
          username: user.username,
          msg: settings.pointTiers[index].msg,
          img: settings.pointTiers[index].img,
          color: settings.pointTiers[index].color,
          status: `Twitch ID not found??!`
        };
      TwitchAPI.getTwitchID(user.username).then(Tdata => {
        if (!Tdata.error) {
          let t_id;
          try {
            t_id = Tdata.data[0].id;
          } catch (err) {
            console.log(err, 'User Deleted?? ^^ ... moving on...');
            res.push(resObj);
            index++;
            userLoop(index);
          };
          //get discord id from twitch ID
          WebsiteAPI.getDiscordID(t_id).then(Ddata => {
            if (Ddata && !Ddata.error) {
              //add discord role
              message.guild.member(Ddata.d_id).roles.add(settings.pointTiers[index].roleID).catch(e => console.error(e, '!!!Error Adding Discord Role ^^'));
              resObj.status = `Role Added | ${settings.chatCommand} `;
            } else if (Ddata.error) {
              resObj.status = Ddata.error === 'User Not Found' ? `Can't Add Role: No Twitch Connection` : `Can't Add Role: No Discord Connection`;
            } else {
              resObj.status = `Can't Add Role: API ERROR`;
            };
            res.push(resObj);
            index++;
            userLoop(index);
          }).catch( () => {
            console.log('!!!Twitch Top Points Website API Error? ^^...');
            res.push(resObj);
            index++;
            userLoop(index);
          });
        } else {
          console.log('!!!Twitch Top Points Error?: ' + Tdata.error);
          res.push(resObj);
          index++;
          userLoop(index);
        };
      }).catch(e => console.error(e, '!!!Something Went Bad (setTopPointRoles) ^^...'));
    };
    userLoop(0);
  });
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
