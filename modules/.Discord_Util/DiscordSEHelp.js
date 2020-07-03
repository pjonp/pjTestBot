const DISCORDBOT = require('../../pjtestbot.js').DISCORDBOT;
let embedThumbnail = 'https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/160/google/40/thinking-face_1f914.png';

//let commandMaster = ["!MULTI", "!TOTALS", "!CLASSIC", "!CMD", "!ADD", "!LOAD", "!OBSHELP", "!SLOTS", "!WATCHTIME", "!INVITE", "!DUPLICATE", "!IDEAS", "!STUDIOMODE", "!ERROR", "!RES", "!FONTS", "!CACHE", "!WELCOME", "!SHARE", "!EXTENSION", "!GC", "!PANELS", "!RENAME", "!PRIVACY", "!CONNECT", "!OBSLIVE", "!OBSLOG", "!HOSTS", "!ALERTS", "!JWT", "!OBSCOOKIES", "!RULES", "!COOKIES", "!LOGOUT", "!SLOBS", "!LEVELS", "!SCREENSHOT", "!ACCOUNTID", "!SEPAYSUPPORT", "!DOCKRELOAD", "!REPORT", "!EDITORGUIDE", "!MERGEACCOUNTS", "!HELPDESK", "!QUESTIONS", "!SEPAY", "!NAMECHANGE", "!RESETGOALS", "!VAC", "!YOUTUBE", "!CSRF", "!2FA", "!RELOG", "!NEW", "!BESTSETTINGS", "!CLEANLOG", "!ADS", "!AUTOCONFIG", "!CONNECTION", "!LAPTOPDISPLAY", "!YTBOT", "!3D", "!DUCKING", "!GAMEMODE", "!FTL", "!TROPHY", "!CRASHLOG", "!ACCEL", "!SPEEDTEST", "!DARKMODE", "!CHATSTATS", "!MERCHWELCOME", "!NEWTWITCHAPI", "!LIGHTSTREAM", "!CURRENTLOG", "!MERCHFAQ", "!MERCHITEMS", "!MERCHPLATFORMS", "!MERCHTICKET", "!PART", "!MERCHIDEAS", "!MANUALCRASH", "!SLOBSIMPORT", "!STREAMDECK", "!OBSREPORT", "!CONSOLE", "!UNLINK", "!DROPPEDFRAMES", "!AUDIOMONITORING", "!MIXERLEVEL", "!FBPRIVACY", "!ELGATO", "!NIGHTBOT", "!YTVERIFY", "!BROWSER", "!NEWOVERLAY", "!STATUS", "!NDI", "!BLOCKEDLINKS", "!WIDGETNAME", "!MRVAC", "!WEBSITE", "!VOD"]

let commandMaster = [{
  name: "MULTI",
  res: "test response"
}, {
  name: "TOTALS",
  res: "test response"
}, {
  name: "CLASSIC",
  res: "test response"
}, {
  name: "CMD",
  res: "test response"
}, {
  name: "ADD",
  res: "test response"
}, {
  name: "LOAD",
  res: "test response"
}, {
  name: "OBSHELP",
  res: "test response"
}, {
  name: "SLOTS",
  res: "test response"
}, {
  name: "WATCHTIME",
  res: "test response"
}, {
  name: "INVITE",
  res: "test response"
}, {
  name: "DUPLICATE",
  res: "test response"
}, {
  name: "IDEAS",
  res: "test response"
}, {
  name: "STUDIOMODE",
  res: "test response"
}, {
  name: "ERROR",
  res: "test response"
}, {
  name: "RES",
  res: "test response"
}, {
  name: "FONTS",
  res: "test response"
}, {
  name: "CACHE",
  res: "test response"
}, {
  name: "WELCOME",
  res: "test response"
}, {
  name: "SHARE",
  res: "test response"
}, {
  name: "EXTENSION",
  res: "test response"
}, {
  name: "GC",
  res: "test response"
}, {
  name: "PANELS",
  res: "test response"
}, {
  name: "RENAME",
  res: "test response"
}, {
  name: "PRIVACY",
  res: "test response"
}, {
  name: "CONNECT",
  res: "test response"
}, {
  name: "OBSLIVE",
  res: "test response"
}, {
  name: "OBSLOG",
  res: "test response"
}, {
  name: "HOSTS",
  res: "test response"
}, {
  name: "ALERTS",
  res: "test response"
}, {
  name: "JWT",
  res: "test response"
}, {
  name: "OBSCOOKIES",
  res: "test response"
}, {
  name: "RULES",
  res: "test response"
}, {
  name: "COOKIES",
  res: "test response"
}, {
  name: "LOGOUT",
  res: "test response"
}, {
  name: "SLOBS",
  res: "test response"
}, {
  name: "LEVELS",
  res: "test response"
}, {
  name: "SCREENSHOT",
  res: "test response"
}, {
  name: "ACCOUNTID",
  res: "test response"
}, {
  name: "SEPAYSUPPORT",
  res: "test response"
}, {
  name: "DOCKRELOAD",
  res: "test response"
}, {
  name: "REPORT",
  res: "test response"
}, {
  name: "EDITORGUIDE",
  res: "test response"
}, {
  name: "MERGEACCOUNTS",
  res: "test response"
}, {
  name: "HELPDESK",
  res: "test response"
}, {
  name: "QUESTIONS",
  res: "test response"
}, {
  name: "SEPAY",
  res: "test response"
}, {
  name: "NAMECHANGE",
  res: "test response"
}, {
  name: "RESETGOALS",
  res: "test response"
}, {
  name: "VAC",
  res: "test response"
}, {
  name: "YOUTUBE",
  res: "test response"
}, {
  name: "CSRF",
  res: "test response"
}, {
  name: "2FA",
  res: "test response"
}, {
  name: "RELOG",
  res: "test response"
}, {
  name: "NEW",
  res: "test response"
}, {
  name: "BESTSETTINGS",
  res: "test response"
}, {
  name: "CLEANLOG",
  res: "test response"
}, {
  name: "ADS",
  res: "test response"
}, {
  name: "AUTOCONFIG",
  res: "test response"
}, {
  name: "CONNECTION",
  res: "test response"
}, {
  name: "LAPTOPDISPLAY",
  res: "test response"
}, {
  name: "YTBOT",
  res: "test response"
}, {
  name: "3D",
  res: "test response"
}, {
  name: "DUCKING",
  res: "test response"
}, {
  name: "GAMEMODE",
  res: "test response"
}, {
  name: "FTL",
  res: "test response"
}, {
  name: "TROPHY",
  res: "test response"
}, {
  name: "CRASHLOG",
  res: "test response"
}, {
  name: "ACCEL",
  res: "test response"
}, {
  name: "SPEEDTEST",
  res: "test response"
}, {
  name: "DARKMODE",
  res: "test response"
}, {
  name: "CHATSTATS",
  res: "test response"
}, {
  name: "MERCHWELCOME",
  res: "test response"
}, {
  name: "NEWTWITCHAPI",
  res: "test response"
}, {
  name: "LIGHTSTREAM",
  res: "test response"
}, {
  name: "CURRENTLOG",
  res: "test response"
}, {
  name: "MERCHFAQ",
  res: "test response"
}, {
  name: "MERCHITEMS",
  res: "test response"
}, {
  name: "MERCHPLATFORMS",
  res: "test response"
}, {
  name: "MERCHTICKET",
  res: "test response"
}, {
  name: "PART",
  res: "test response"
}, {
  name: "MERCHIDEAS",
  res: "test response"
}, {
  name: "MANUALCRASH",
  res: "test response"
}, {
  name: "SLOBSIMPORT",
  res: "test response"
}, {
  name: "STREAMDECK",
  res: "test response"
}, {
  name: "OBSREPORT",
  res: "test response"
}, {
  name: "CONSOLE",
  res: "Consoles do not have native support for overlays. You would need a capture card and a PC with OBS in order to have Overlays over your console gameplay. We have an blog post about how to setup console streaming with our essential tools https"
}, {
  name: "UNLINK",
  res: "test response"
}, {
  name: "DROPPEDFRAMES",
  res: "test response"
}, {
  name: "AUDIOMONITORING",
  res: "test response"
}, {
  name: "MIXERLEVEL",
  res: "test response"
}, {
  name: "FBPRIVACY",
  res: "test response"
}, {
  name: "ELGATO",
  res: "test response"
}, {
  name: "NIGHTBOT",
  res: "test response"
}, {
  name: "YTVERIFY",
  res: "test response"
}, {
  name: "BROWSER",
  res: "test response"
}, {
  name: "NEWOVERLAY",
  res: "test response"
}, {
  name: "STATUS",
  res: "test response"
}, {
  name: "NDI",
  res: "test response"
}, {
  name: "BLOCKEDLINKS",
  res: "test response"
}, {
  name: "WIDGETNAME",
  res: "test response"
}, {
  name: "MRVAC",
  res: "test response"
}, {
  name: "WEBSITE",
  res: "test response"
}, {
  name: "VOD",
  res: "test response"
}];

commandMaster.sort(function(a, b) {
  let x = a.name.toLowerCase(),
    y = b.name.toLowerCase();
  if (x < y) return -1;
  else if (x > y) return 1;
  else return 0;
});

let messageChannelID = '',
  messageID = '',
  messageUserID = '',
  working = false,
  workingTimer,
  workingTimeOut = 30,
  commandsInPages = [],
  pageNumber = 0;
const size = 25,
  moveForwardEmote = '⏭️',
  moveBackEmote = '⏮️',
  trashEmote = '🗑️';


DISCORDBOT.on('messageReactionAdd', (messageReaction, user) => {
  if (user.bot) return;
  if (!working && (messageReaction.message.id !== messageID || user.id !== messageUserID)) return;
  switch (messageReaction.emoji.name) {
    case moveForwardEmote:
      pageNumber++;
      updateMessage(messageReaction.message, buildEmbed(commandsInPages[pageNumber]))
      break;
    case moveBackEmote:
      pageNumber--;
      updateMessage(messageReaction.message, buildEmbed(commandsInPages[pageNumber]))
      break;
    case trashEmote:
    clearTimeout(workingTimer)
      working = false;
      messageReaction.message.delete().catch(e => console.error(e, 'Could not Delete seHelp embed message ^^...'));
      break;
    default:
      return;
  };
  return;
});

module.exports = {
  chatCommand: "%sehelp",
  about: "List Stream Elemetns Discord Commands",
  main: (message, commands) => {
    //  if (!message.member.hasPermission('MANAGE_ROLES')) return;
    if (working) return;
    working = true;
    pageNumber = 0;
    commandsInPages = [];
    messageUserID = message.author.id;


    //reload commandMaster list;

    let commandList = [...commandMaster],
      commandPage = [],
      msg = message.cleanContent.split(' ');

    if (msg[1]) {
      commandList = commandMaster.filter(i => i.name.toLowerCase().includes(msg[1].toLowerCase()));
    };
    commandList.forEach(i => {
      if (commandPage.length < size) commandPage.push(i);
      else {
        commandsInPages.push(commandPage);
        commandPage = [i];
      };
    });
    if (commandPage.length > 0) commandsInPages.push(commandPage);

    sendMessage(message, buildEmbed(commandsInPages[pageNumber]));
  } //main
}; //end exports

const sendMessage = (message, embed) => {
  message.channel.send({
    embed
  }).then(msg => {
    messageChannelID = msg.channel.id;
    messageID = msg.id;
    if (commandsInPages.length > 1) {
      msg.react(moveForwardEmote).then(reaction => reaction.message.react(trashEmote)).catch(e => console.error(e));
    } else {
      msg.react(trashEmote).catch(e => console.error(e));
    };
    workingTimer = setTimeout(() => timeoutMessage(msg), workingTimeOut * 1000);
  }).catch(error => console.error(`!! Couldn't Send Discord SE Help Embed...`));
};

const timeoutMessage = (message) => {
  clearTimeout(workingTimer);
  working = false
  message.reactions.removeAll().catch(e => console.error(e, 'Error removing embeds ^^...'));
};

const updateMessage = (message, embed) => {
  clearTimeout(workingTimer);
  message.reactions.removeAll().catch(e => console.error(e, 'Error removing embeds ^^...'));
  message.edit({
      embed
    })
    .then(msg => {
      if (pageNumber > 0) {
        msg.react(moveBackEmote).catch(e => console.error(e));
      };
      if (pageNumber < commandsInPages.length - 1) {
        msg.react(moveForwardEmote).catch(e => console.error(e));
      };
      msg.react(trashEmote).catch(e => console.error(e));
      workingTimer = setTimeout(() => timeoutMessage(msg), workingTimeOut * 1000);
    }).catch(e => console.error(e));
};

const buildEmbed = (page) => {
  if(!page) page = [{name: "No Results", res: "(╯°□°）╯︵ ┻━┻"}];
  let fields = page.map(i => {
      return {
        name: i.name,
        value: `\`\`\`css\n${i.res.slice(0, 31)}..\`\`\``,
        inline: true
      };
    }),
    embed = {
      "color": 13632027,
      "thumbnail": {
        "url": embedThumbnail
      },
      "fields": fields
    };
  return embed;
};
