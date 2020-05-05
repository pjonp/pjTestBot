const fs = require('fs');
const GameWeapons = JSON.parse(fs.readFileSync('./modules/jaz_game/JazGameWeapons.json'));
const GameSettings = JSON.parse(fs.readFileSync('./modules/jaz_game/JazGameSettings.json'));

//timer setup
let gameTime,
  currentRound,
  gameTimer,
  gameRunning;

//START GAME
const JazGameBuild = async (message) => {
  console.log('GAME STARTED!!!!!')
  gameRunning = true;
  gameTime = GameSettings.roundMinutes * 60 * 1000;
  currentRound = 1;
  let gameData = JSON.parse(fs.readFileSync('./modules/jaz_game/JazGameData.json'));
  let randPlayers = gameData.players.filter(i => i.active); //filter out ACTIVE players
  //randomize the player base for "X" times (don't randomize all)
  for (let i = randPlayers.length - 1; i >= randPlayers.length - GameSettings.numberOfPlayers; i--) {
    let getRandIndex = Math.floor((i + 1) * Math.random());
    let temp = randPlayers[getRandIndex];
    randPlayers[getRandIndex] = randPlayers[i];
    randPlayers[i] = temp;
  }
  //trim array to just the "X" players.
  randPlayerNames = randPlayers.slice(0, GameSettings.numberOfPlayers).map(i => i.userName) //used later in the chat announce
  //build "inGamePlayers" objects
  inGamePlayers = randPlayers.slice(0, GameSettings.numberOfPlayers).map(i => {
    return ({
      "userID": i.userID,
      "userName": i.userName,
      "alive": true,
      "health": GameSettings.baseHealth
    });
  });
  //set the "inGamePlayers" array
  gameData.inGamePlayers = inGamePlayers;
  //set game setting to true
  gameData.running = true;
  //set game start date/time
  gameData.gameStart = new Date().toUTCString();
  //update each player card
  randPlayers.slice(0, GameSettings.numberOfPlayers).forEach(i => {
    let pos = gameData.players.findIndex(j => j.userID === i.userID);
    gameData.players[pos].inBattle = true;
    gameData.players[pos].lastBattle = gameData.gameStart;
  });
  //save Game data
  let didSave = await saveGameData(gameData).catch(() => {
    message.channel.send(`Error saving Game Data file. Game cannot be started!`).catch(err => {
      console.log(err)
    });
  }) //send info to save function
  //verify save worked
  if (!didSave) { //end if cannot save file!
    console.log('Promise Error!');
    return;
  }
  //announce players AFTER save
  message.channel.send(`${GameSettings.numberOfPlayers} have been chosen: ${randPlayerNames}`).catch(err => {
    console.log(err)
  });

  //START THE GAME

  gameTimer = setInterval(() => {
    gameAreaResize(message)
  }, gameTime); //first action starts after gameTime
  return; //end Export function.
};

//MAIN GAME TIMER
let gameAreaResize = async (message) => {
  clearInterval(gameTimer); // clear timer
  if(!gameRunning) return;
  //call the game logic function and get results.
  let roundName = currentRound % 2 === 0 ? `Night ${Math.ceil(currentRound/2)}` : `Day ${Math.ceil(currentRound/2)}`
  if (gameTime > 10000) {
    gameTime = gameTime * GameSettings.roundDecreaseFactor;
  }
  let isGameOver = await jazGameLogic(message, roundName, gameTime).catch(); //RUN Game Logic and check if Game is over
  if (isGameOver) {
    JazGameBuild(message); //auto restart
    return;
  }; //END if game over
  currentRound += 1;
  gameTimer = setInterval(() => {
    gameAreaResize(message)
  }, gameTime); // restart timer with less time
};

//MAIN GAME LOGIC.
async function jazGameLogic(message, roundName, gameTime) {
  let gameData = JSON.parse(fs.readFileSync('./modules/jaz_game/JazGameData.json'));
  //randomize for priority
  let playersAlive = gameData.inGamePlayers.filter(i => i.alive) //get alive players
  for (let i = playersAlive.length - 1; i >= 0; i--) {
    let getRandIndex = Math.floor((i + 1) * Math.random());
    let temp = playersAlive[getRandIndex];
    playersAlive[getRandIndex] = playersAlive[i];
    playersAlive[i] = temp;
  };
  //[0] attacks [last]
  //[1] attacks [last-1] OR can heal if only 3
  //[2] attacks [last-2] OR can heal if only 5
  //...etc...

  //get number remaining
  let playersLeftOdd = playersAlive.length % 2 === 0 ? false : true; //player length / 2 have a remainder?
  let resultString = []; //empty for final message
  for (let i = 0; i < Math.floor(playersAlive.length / 2); i++) { //loop for even pairs
    let attacker = playersAlive[i], //[0]
      target = playersAlive[playersAlive.length - 1 - i], //[last person]

      weapon = GameWeapons[Math.floor(Math.random() * GameWeapons.length)], //get from JSON

      damage = Math.floor(Math.random() * (weapon.maxDamage - weapon.minDamage)) + weapon.minDamage; //Math.floor(Math.random() * (max - min)) + min //get from JSON
    resultString.push(`${attacker.userName} attacks ${target.userName} with a ${weapon.name} for ${damage} damage.`); //get from JSON
    //record attacker info
    //update HP for target
    target.health -= damage;
    let pos = gameData.inGamePlayers.findIndex(i => i.userName === target.userName);
    gameData.inGamePlayers[pos].health = target.health;
    //if target < 0 HP, remove from gameData.inGamePlayers
    if (target.health <= 0) {
      gameData.inGamePlayers[pos].alive = false;
    };
  }; //end "evens" loop
  //if odd player does something?
  if (playersLeftOdd) {
    let midPlayerNumber = Math.floor(playersAlive.length / 2);
    resultString.push(`${playersAlive[midPlayerNumber].userName} sips tea.`);
  };

  let gameOver = false,
    gameNumber = gameData.gameNumber,
    playersRemoved = gameData.inGamePlayers.filter(i => !i.alive); //get removed players

  playersAlive = gameData.inGamePlayers.filter(i => i.alive); //update alive players

  //check for game over?
  if (playersAlive.length === 1) {
    gameOver = true;
    gameData = await jazGameOver(message, gameData, playersAlive[0]);
  };
  //Save Gamedata....
  let saveRoundResult = await saveGameData(gameData).catch(() => {
    message.channel.send(`Error saving Game Data file. Game Canceled :(`).catch(err => {
      console.log(err)
    });
  });
  //verify saveworked
  if (!saveRoundResult) { //end if cannot save file!
    console.log('Promise Error! Game Canceled :(');
    return;
  };

  let endOfDayResults = playersAlive.sort((i, j) => {
    return j.health - i.health
  }).map(i => `${i.userName}: ${i.health}HP`)

  if (playersRemoved.length > 0) {
    playersRemoved.forEach(i => {
      endOfDayResults.push(`${i.userName}: Eliminated`)
    })
  };

  //Build Embeds
  let isNight = roundName.startsWith('Night'),
    embedDescription = `${resultString.join("\n")}`,
    embedColor = 13369497,
    embedThumnailIcon = "http://clipart-library.com/img/1338229.gif",
    embedAuthorIcon = "http://clipart-library.com/img/1338229.gif"
  if (isNight) {
    embedDescription = `${resultString.join("\n")}`;
    embedColor = 4868682;
    embedThumnailIcon = "http://clipart-library.com/images_k/moon-transparent-background/moon-transparent-background-18.png";
    embedAuthorIcon = "http://clipart-library.com/images_k/moon-transparent-background/moon-transparent-background-18.png";
  };

  let embed = {
    "description": embedDescription,
    "url": "https://discordapp.com",
    "color": embedColor,
    "thumbnail": {
      "url": embedThumnailIcon
    },
    "author": {
      "name": `${roundName}`,
      "icon_url": embedAuthorIcon
    }
  };

  return new Promise((resolve, reject) => {
    message.channel.send({
      embed
    }).then(
      response => response.delete({
        timeout: gameTime + GameSettings.roundDelay
      }).catch(err => console.log(err))
    ).catch(err => console.log(err));

    setTimeout(() => { //Pause for results
      if(!gameRunning) return;
      if (isNight && !gameOver) { //if not day & game not over
        embed.author.name = `Round ${roundName.replace('Night ','')} Results:`
        embed.author.icon_url = ''
        embed.thumbnail.url = ''
        embed.description = `${endOfDayResults.join("\n")}`
        message.channel.send({
          embed
        }).catch(err => {
          console.log(err)
        });
      }
      if (gameOver) {
        console.log('game over!')
        embed.author.name = `${winner} Wins Game #${gameNumber}`
        embed.author.icon_url = ''
        embed.thumbnail.url = winnerAvatar
        embed.description = ``
        message.channel.send({
          embed
        }).catch(err => {
          console.log(err)
        });
      }
      resolve(gameOver);
    }, GameSettings.roundDelay); //Result Delay
  });
};

async function jazGameOver(message, gameData, winnerObj) {
  winner = winnerObj.userName;
  winnerAvatar = await message.guild.members.fetch(winnerObj.userID).catch(console.error);
  winnerAvatar = winnerAvatar.user.avatarURL();
  //update all players data
  gameData.inGamePlayers.forEach(i => {
    pos = gameData.players.findIndex(j => j.userID === i.userID)
    gameData.players[pos].inBattle = false;
    //add win to winner
    if (gameData.players[pos].userName === winner) {
      gameData.players[pos].wins += 1;
    };
    gameData.players[pos].lastBattle = gameData.gameStart;
  });
  //reset game varaibles
  gameData.gameNumber += 1;
  gameData.running = false;
  gameData.inGamePlayers = [];

  return gameData;
};


const JazGameReset = async (message) => {
  clearInterval(gameTimer); // clear timer
  gameRunning = false;
  let gameData = JSON.parse(fs.readFileSync('./modules/jaz_game/JazGameData.json'));
  gameData.inGamePlayers.forEach(i => {
    pos = gameData.players.findIndex(j => j.userID === i.userID);
    gameData.players[pos].inBattle = false;
  });
  //reset game varaibles
  gameData.running = false;
  gameData.inGamePlayers = [];

  let didSave = await saveGameData(gameData).catch(() => {
    message.channel.send(`Error saving Game Data file. Game cannot be reset!`).catch(err => {
      console.log(err)
    });
  })
  //verify save worked
  if (!didSave) { //end if cannot save file!
    console.log('Promise Error!');
    return;
  }
  message.channel.send(`Game has been canceled or reset.`).catch(err => {
    console.log(err)
  });
  console.log('Game reset!')
  return;
};


//SAVE DATA FUNCTION
const saveGameData = async (gameData) => {
  //SAVE THE NEW INFORMATION
  return new Promise((resolve, reject) => {
    fs.writeFile('./modules/jaz_game/JazGameData.json', JSON.stringify(gameData, null, 2), (err) => {
      if (err) {
        console.log(err, 'there was an error saving the JSON file! ^^'); //Game is updated but JSON is locked...
        reject(false);
      } else {
        console.log('Game Data file has been saved! [GameFunction]'); //JSON saved
        resolve(true);
      };
    });
  })
};

exports.JazGameBuild = JazGameBuild;
exports.JazGameReset = JazGameReset;
