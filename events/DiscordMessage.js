const setup = require('../.hidden/settings.json'),
  JazGame = require('../modules/jaz_game/JazGameMain.js');

let myName = 'pjtestbot', //lowercase
  myID = '676333410939174914',
  othersName = 'notapjbot', //lowercase
  othersID = '294317222841548802',
  sleeps = ['go offline', `sleep <@!${myID}>`], //all lowercase sleep words
  awakes = ['get online', `wakeup <@!${myID}>`], //all lowercase awake words
  timeouts = ['timeout', 'quick nap', 'take a break'],
  defaultTimeout = 5 * 60000, //minutes * milliseconds,
  status = 'online',
  timeoutRooms = [],
  timeoutRoomNames = [];

module.exports = (DISCORDBOT, message) => {
  if (message.author.bot) return;

  //Jaz Game
  if (message.content.startsWith(JazGame.settings.chatCommand)) { //from JazGameSettings.json
    JazGame.gameCommands(message)
  };

  /*
    console.log('D:', message.content);
    message.channel.send(`${message.content}`).catch(err => {
      console.log(err, 'something went bad :-|')
    });
  */
  let msg = message.content.toLowerCase() //refactor to msg (lowercase)
  let isMessageFromOwner = message.author.id === setup.D_OWNERID
  if (isMessageFromOwner) {
    if (sleeps.some(sleepcheck => msg.includes(sleepcheck)) &&
      message.mentions.has(myID)) { //doesn't include others name [whoIsTheTarget()]
      status = 'dnd';
      console.log('test3');
      message.channel.send('Offline.');
      DISCORDBOT.user.setStatus(status);
      DISCORDBOT.user.setActivity('no');
      return;
    };
    if (awakes.some(awakecheck => msg.includes(awakecheck)) &&
      message.mentions.has(myID)) { //doesn't include others name [whoIsTheTarget()]
      message.channel.send('Online.');
      status = 'online';
      DISCORDBOT.user.setStatus(status);
      DISCORDBOT.user.setActivity('yes');
      return;
    };
  };
  if (status === 'dnd') return; //END if in sleep mode
  if (status === 'idle' && timeoutRooms.some(i => {
      return message.channel.id === i;
    })) return; //Room Mute

  // ANY THING BELOW THIS ONLY WORKS IF BOT IS AWAKE
  //new commands
  if (msg.includes('mentioned')) {
    message.channel.send(`Mentioned in that message: ${whoIsTargeted(message)}`)
  };
  if (message.mentions.has(myID) && timeouts.some(i => msg.includes(i))) { //isMessageFromOwner && owner check removed
    status = 'idle'; //set global var to idle
    DISCORDBOT.user.setStatus(status); //update both
    timeoutRooms.push(message.channel.id) //save timeout room ID
    timeoutRoomNames.push(message.channel.name) //save timeout room Name
    DISCORDBOT.user.setActivity(`I'm muted in ${timeoutRooms.length} channels :-|`);
    message.channel.send(`muted in this channel for ${defaultTimeout / 60000} minutes`)

    setTimeout((tempRoom = message.channel) => {
      let roomIndex = timeoutRooms.indexOf(tempRoom.id)
        console.log('End of TO: ', tempRoom.name);
      timeoutRooms.splice(roomIndex, 1) //remove timeout ID from Array
      timeoutRoomNames.splice(roomIndex, 1) //remove timeout name from Array
      console.log('Rooms still in TO: ', timeoutRoomNames)

      if (timeoutRooms.length < 1) { //No timeouts?
        status = 'online';
        DISCORDBOT.user.setStatus(status);
        DISCORDBOT.user.setActivity(`I'm back in all channels!`);
      } else {
        DISCORDBOT.user.setActivity(`I'm muted in ${timeoutRooms.length} channels :-|`);
      };
    }, defaultTimeout);
  };
  if (msg.includes('muted rooms')) { //testing list of muted rooms
    message.channel.send(`Muted in: ${timeoutRoomNames.join(' | ')}`)
  };


};

const whoIsTargeted = (message) => { //Was this bot, Other Bot or Owner mentioned?
  let targets = [setup.D_OWNERID, myID, othersID]
  let filterTargets = targets.filter(i => {
    return message.mentions.has(i)
  })
  if (filterTargets.length < 1) { //None of my 3 accounts
    return 'none';
  } else if (filterTargets.length === 3) { //All 3 of my accounts
    return 'all';
  } else if (filterTargets.length === 1) { //If only 1 mention, which one?
    return filterTargets[0] === targets[0] ? 'owner' :
      filterTargets[0] === targets[1] ? 'me' :
      'otherBot';
  } else if (filterTargets[0] === targets[0]) { //2 mentions & includes owner
    return filterTargets[1] === targets[1] ? 'us' : 'others'; //Owner + this bot or Owner + other bot
  } else {
    return 'bots' //2 targets, Owner not tagged
  }
}
