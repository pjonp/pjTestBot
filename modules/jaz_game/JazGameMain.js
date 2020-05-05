const fs = require('fs');
let settings = JSON.parse(fs.readFileSync('./modules/jaz_game/JazGameSettings.json')); //load settings
const JazGameFunctions = require('./JazGameFunctions.js'); //import Jaz's game

module.exports = { //
  settings: settings, //Only used to export command name
  gameCommands: async (message) => { //MAIN FUNCTION!
    //****************************
    gameData = JSON.parse(fs.readFileSync('./modules/jaz_game/JazGameData.json')); //!!!!!! READ ONLY
    //****************************
    console.log('....jaz game function used')
    let command = message.content.toLowerCase().split(' ')[1] //what is target word after command?
    if (command === 'add') {
      //    console.log(message.guild.members)
      addPlayer(gameData, message) //go to ADD USER
      return;
    } else if (command === 'remove') {
      removePlayer(gameData, message) //go to REMOVE USER
      return;
    } else if (command === 'startgame') {
      if (gameData.running) {
        message.channel.send('Game is currently in progress...').catch(err => {
          console.log(err, 'game already running ^^')
        });
        return;
      };
      JazGameFunctions.JazGameBuild(message)
      return;
    } else if (command === 'stopgame') { //check list
      JazGameFunctions.JazGameReset(message)
      return;
    } else {
      message.channel.send(`${settings.chatCommand} options are: startgame | add @mention | remove @mention | stopgame`).catch(err => {
        console.log(err, 'listplayers error ^^')
      });
    }
  }
};

//ADD USER
const addPlayer = async (gameData, message) => {
  let msg = 'error add?'
  let getMentions = message.mentions.users //get mentions
  if (getMentions.size !== 1) { //require only 1 mention
    message.channel.send(`Please add only 1 mention`).catch(err => {
      console.log('Error sending message to chat: ', err)
    });
    return;
  };
  let userPlayerObj = { //match the GameSetting.json
    "userID": getMentions.first().id,
    "userName": getMentions.first().username,
    "joinDate": new Date().toUTCString(),
    "active": true,
    "inBattle": false,
    "lastBattle": "date",
    "wins": 0,
  }
  let targetIndex = gameData.players.findIndex(i => i.userID === userPlayerObj.userID)
  if (targetIndex >= 0) { //check if player already exists
    if (gameData.players[targetIndex].active) {
      msg = `${userPlayerObj.userName} is already active!`;
    } else {
      gameData.players[targetIndex].active = true;
      await saveGameData(gameData).then(() => {
        msg = `${userPlayerObj.userName} has been set to active!`;
      }).catch(() => {
        msg = `Error saving file. See console.`;
        console.log('Promise Error!');
      })
    };
  } else {
    gameData.players.push(userPlayerObj) //add new player
    await saveGameData(gameData).then(() => {
      msg = `${userPlayerObj.userName} added to player list!`
    }).catch(() => {
      msg = `Error saving file. See console.`;
      console.log('Promise Error!');
    })
  };
  message.channel.send(msg).catch(err => {
    console.log('Error sending message [added] to chat: ', err)
  });
};

//REMOVE PLAYER
const removePlayer = async (gameData, message) => {
  let msg = 'error remove?'
  let getMentions = message.mentions.users
  if (getMentions.size !== 1) { //force 1 mention
    message.channel.send(`Please use only 1 mention to remove a user`).catch(err => {
      console.log('Error sending message to chat: ', err)
    });
    return;
  };
  let target = message.mentions.users.first()
  let targetIndex = gameData.players.findIndex(i => i.userID === target.id)
  if (targetIndex < 0) { //check if player exists
    msg = `${target.username} does not exist`
  } else if (!gameData.players[targetIndex].active) {
    msg = `${target.username} is already inactive!`
  } else {
    gameData.players[targetIndex].active = false;
    await saveGameData(gameData).then(() => {
      msg = `${target.username} changed to inactive!`
    }).catch(() => {
      msg = `Error saving file. See console.`;
      console.log('Promise Error!');
    });
  };
  message.channel.send(`${msg}`).catch(err => {
    console.log('Error sending message [remove] to chat: ', err)
  });
};

//SAVE DATA
const saveGameData = (gameData) => {
  //SAVE THE NEW INFORMATION
  return new Promise((resolve, reject) => {
    fs.writeFile('./modules/jaz_game/JazGameData.json', JSON.stringify(gameData, null, 2), (err) => {
      if (err) {
        console.log(err, 'Saved virtually.... but there was an error saving the JSON file! ^^'); //Game is updated but JSON is locked...
        reject(false);
      } else {
        console.log('Game Data file has been saved! [GameMain]'); //JSON saved
        resolve(true);
      };
    });
  }); //Error in promise. Something broke.
};
