let main = document.getElementById("main"),
  chatCommand = '!guess',
  modControl = false,
  subMode = false,
  points = 97,
  roundTimer,
  countdownInterval,
  startGameTimer,
  gameTimeLimitTimer,
  gameRunning = false,
  logoImage = `https://cdn.streamelements.com/uploads/02176cd6-828a-4fb9-8b25-cf0c34967f50.jpg`,
  gridSize = 6,
  gameStartDelay = 30,
  roundDelay = 1,
  gameTimeout = 1,
  gameEndDelay = 1,
  answer = '',
  GAMEDATA = [],
  gameNumber = 0,
  jebaitedAPIToken = 'noTokenSupplied';

const GAMEDATAURL = 'https://raw.githubusercontent.com/pjonp/pjTestBot/master/modules/reveal_game/RevealGameDataBase.json';

const GetData = () => {
  return fetch(GAMEDATAURL)
    .then(response => response.json())
    .then(data => {
      GAMEDATA = data;
    })
    .catch(error => {
      console.error(`Error Reading JSON file`)
    });
};

//EVENTS

window.addEventListener('onEventReceived', (obj) => {
  const event = obj.detail.listener;
  if (event !== 'message') {
    return;
  }
  onMessage(obj.detail.event.data);
  return;
});


window.addEventListener('onWidgetLoad', async (obj) => {

  const fieldData = obj.detail.fieldData;

  chatCommand = fieldData.chatCommand;
  modControl = fieldData.modControl === 'Yes';
  subMode = fieldData.subMode === 'Yes';
  points = fieldData.points;
  logoImage = fieldData.coverImageUpload;
  gridSize = fieldData.gridSize;
  gameStartDelay = fieldData.gameStartDelay;
  roundDelay = fieldData.roundDelay;
  gameTimeout = fieldData.gameTimeout;
  gameEndDelay = fieldData.gameEndDelay;
  jebaitedAPIToken = fieldData.jebaitedToken;

  console.log(logoImage);
  await GetData();

  //on load for sizing
  buildGame()
  setTimeout(() => {
    gameOver();
  }, 10000);
});


//SERVER LOGIC
let onMessage = (msg) => {
  let msgA = msg.text.toLowerCase().split(' '),
    res = '';

  if (msgA[0] !== chatCommand) return;

  msgA.shift(); //REMOVE COMMAND FROM MESSAGE

  let isBroadcaster = msg.badges.some(i => i.type === 'broadcaster'),
    isMod = msg.badges.some(i => i.type === 'mod'),
    isSub = msg.tags.subscriber !== '0';

  let canEdit = modControl && isMod,
    subCheck = subMode === isSub;

  if (msgA[0] === 'start') {
    if (isBroadcaster || canEdit) {
      buildGame();
      res = `Game started: use {chatCommand} <answer>`
      sayMessage(res);
      return;
    };
  } else if (msgA[0] === 'stop') {
    if (isBroadcaster || canEdit) {
      gameOver();
      res = `{chatCommand} Game has been stopped.`
      sayMessage(res);
      return;
    };
  } else if (msgA[0] === answer.toLowerCase()) {
    if (isBroadcaster || isSub || subCheck) {
      gameOver(msg.displayName);
      return;
    };
  };
  return;
};

//OVERLAY LOGIC
let buildGame = () => {

  if (gameRunning) return;

  let startDelay = gameStartDelay,
    randAnswer = GAMEDATA[Math.floor(Math.random() * GAMEDATA.length)] || 150,
    bgImage = randAnswer.image;

  answer = randAnswer.name;
  gameRunning = true;

  console.log('cheat mode:', answer.toLowerCase());

  gameTimeLimitTimer = setTimeout(() => {
    gameOver();
  }, ((gameStartDelay + gameTimeout) + (gridSize * gridSize * roundDelay)) * 1000);

  gameRunning = true;
  main.style.backgroundImage = `url(${bgImage})`;

  let squares = gridSize * gridSize,
    squareArr = [],
    htmlString = '';
  for (i = 0; i < squares; i++) {
    let radius = i === 0 ? "80px 0px 0px 0px" :
      i === gridSize - 1 ? "0px 80px 0px 0px" :
      i === squares - 1 ? "0px 0px 80px 0px" :
      i === squares - gridSize ? "0px 0px 0px 80px" : "0px 0px 0px 0px";

    let row = Math.floor(i / gridSize),
      col = i % gridSize,
      bgX = -col * (800 / gridSize),
      bgY = -row * (800 / gridSize);

    htmlString += `
      <div id=${i} class="coverBox" style="background-image: url(${logoImage}); background-position: ${bgX}px ${bgY}px; width: ${800/gridSize}px; height: ${800/gridSize}px; border-radius: ${radius}">
      </div>`;
    squareArr.push(i)
  };

  htmlString += `<span id='status'>
  GAME STARTING IN&nbsp;<span id='timer'>${startDelay}</span>&nbsp;SECONDS!
</span>`
  main.innerHTML = htmlString;
  main.classList.remove("hide")
  main.classList.add("show");
  countdownInterval = setInterval(() => {
    startDelay--
    if (startDelay === 1) document.getElementById("status").classList.add("hide");
    document.getElementById("timer").innerHTML = startDelay;
  }, 1000);

  startGameTimer = setTimeout(() => {
    clearInterval(countdownInterval);
    gameRound(squareArr, roundDelay);
    document.getElementById("status").style.display = 'none';
  }, startDelay * 1000)
};

let gameRound = (squareArr, roundDelay) => {
  if (squareArr.length === 0 || !gameRunning) return;
  let randSquare = squareArr.splice(Math.floor(Math.random() * squareArr.length), 1)
  target = document.getElementById(randSquare);
  target.style.backgroundColor = 'transparent';
  target.style.backgroundImage = null;
  roundTimer = setTimeout(() => {
    gameRound(squareArr, roundDelay);
  }, roundDelay * 1000)
  return;
};

let gameOver = (winner) => {
  //clear all timers
  clearTimeout(roundTimer);
  clearInterval(countdownInterval);
  clearTimeout(startGameTimer);
  clearTimeout(gameTimeLimitTimer);

  gameRunning = false;

  let res = winner ? `${winner} caught ${answer}!` : `${answer} has escaped!`;

  main.innerHTML = `<span id='status'>${res}</span>`
  if (winner) {
    savePoints(winner);
  };
  setTimeout(() => {
    if (gameRunning) return;
    main.classList.add("hide");
  }, gameEndDelay * 1000);
  if(gameNumber) {
  sayMessage(res);
  };
  gameNumber++
  return;
};

//lx API
const savePoints = (username) => {
  /*
  socket.emit('saveSEPoints',
              {
    			'username': username,
    			'points': points
 			 }
   );
   */
  fetch(`https://api.jebaited.net/addPoints/${jebaitedAPIToken}/${username}/{points}`)
    .catch(error => {
      console.error(`Error saving points`)
    });
};

const sayMessage = (message) => {
  message = encodeURIComponent(message);
  fetch(`https://api.jebaited.net/botMsg/${jebaitedAPIToken}/${message}`)
    .catch(error => {
      console.error(`Error sending message to chat`)
    });
};
