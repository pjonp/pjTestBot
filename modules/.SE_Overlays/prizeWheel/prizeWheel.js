console.log('LOAD');
//Hidden Settings. These Are Fixed and will never change; (constant variables)
const WheelBot = 'yourbotname', //Lowercase name if wanting to use a bot to call commands
  tickSoundVolume = 0.5, //tick sound volume
  spinDelay = 1.5, //delay for wheel to start when off screen (sec)
  hideWheelAfterSpin = true, //hide the wheel when done spinning; default: true
  wheelGlow = 'black', //inner glow of the wheel; default wheel: white
  wheelGlowAmount = 0.5, //default 0.5,
  spinEndBgColor1 = 'white',
  spinEndBgColor2 = 'gray',
  spinEndFontColor = 'black',
  pointerAngle = 0,
  tickSound = new Audio('https://raw.githubusercontent.com/zarocknz/javascript-winwheel/master/examples/wheel_of_fortune/tick.mp3'),
  RandomInt = (min, max) => Math.floor((Math.random() * (max - min) + min));
//set tick volume.
tickSound.volume = tickSoundVolume;
//Global Code variables that will change over time.
let theWheel, wheelSpinning = false,
  gameQueue = [],
  wheelOnScreen = false,
  wheelAngle = 0,
  randomSpins, randomTime, fieldData, jebaitedAPI, platform, streamerUserId, waitingWheel, changeCenterImage = false,
  centerImages = [];
//MASTER WHEEL LIST; BUILT ON WIDGET LOAD
let prizeWheelSegments = [];
//Widget functions
const Widget = {
  wait: (ms) => new Promise(r => setTimeout(r, ms)),
  verifyBotMsg: () => jebaitedAPI.checkScope('botMsg').catch(e => {
    fieldData.sayToChat = false;
    Widget.displayError(`Jebaited botMsg Error. Messages cannot be sent to chat: ${e.error ? e.error : e}`);
  }),
  verifyAddPoints: () => jebaitedAPI.checkScope('addPoints').catch(e => {
    fieldData.addPoints = false;
    Widget.displayError(`Jebaited addPoints Error. Loyality points cannot be edited: ${e.error ? e.error : e}`);
  }),
  say: (msg) => { //say to chat
    if (!fieldData.sayToChat) return console.log('jebaited botSay is disabled; msg was not sent to chat: ', msg);
    jebaitedAPI.sayMessage(`/me ${msg}`).catch(e => console.log('jebaited.sayMessage: ', e));
  },
  addPoints: (user, points, isTest) => {
    if (!fieldData.addPoints) return console.log('jebaited addPoints is disabled; points were not added.');
    if (isTest) return console.log('Event is a Test; Points are not added.');
    jebaitedAPI.addPoints(user, points).then(d => console.log(`${points} points added to ${user}`)).catch(e => Widget.displayError(`Could Not Add ${points} to ${user}: ${e.error ? e.error : e}`));
  },
  displayError: (e, critical = false) => {
    console.log('Error: ', e, critical);
    if (critical) {
      $('#errorText').append(`<div class='errorText'>${e.error ? e.error : e}.<br>This is a critical error and widget is disabled!</div>`);
      Widget.wait(5000).then(() => $('#container').html(''));
    } else {
      $('#errorText').append(`<div class='errorText'>${e.error ? e.error : e}.<br>This message will auto delete after 10 seconds</div>`);
      Widget.wait(10000).then(() => $('.errorText').first().remove());
    };
  }
};
/* WIDGET EVENTS: https://reboot0-de.github.io/se-tools/module-Events.html */
//Test Button
function onWidgetButton(data) {
  if (data.field === 'testButton') {
    showWheel();
    startSpin({
      user: '💚 pjonp 🚀',
      prizeList: prizeWheelSegments,
      isTest: true
    }).then((i) => console.log('RESULT ', i));
  };
};
//Broadcaster Commands
//let fieldData.newWheelCmd = '!newwheel'; //hidden hard coded command
//
function onMessage(chatMessage) {
  //refactorage:
  let hasPerm = false,
    chatArgs = [],
    spinCommand, showWheelCmd, hideWheelCmd, newWheelCmd;
  //
  if (platform === 'twitch') {
    chatArgs = chatMessage.getWordList();
    if (chatMessage.hasUserId(streamerUserId) || chatMessage.hasUsername(WheelBot)) hasPerm = true;
    if (chatMessage.isCommand(fieldData.spinCommand)) spinCommand = true;
    else if (chatMessage.isCommand(fieldData.wheelShowCommand)) showWheelCmd = true;
    else if (chatMessage.isCommand(fieldData.wheelHideCommand)) hideWheelCmd = true;
    else if (chatMessage.isCommand(fieldData.newWheelCmd)) newWheelCmd = true;
    else return;
  } else if (platform === 'trovo') {
    chatArgs = chatMessage.data.content.split(' ');
    if (chatMessage.data.roles.some(i => i === 'streamer') || chatMessage.data.nick_name === WheelBot) hasPerm = true;
    if (chatArgs[0] === fieldData.spinCommand) spinCommand = true;
    else if (chatArgs[0] === fieldData.wheelShowCommand) showWheelCmd = true;
    else if (chatArgs[0] === fieldData.wheelHideCommand) hideWheelCmd = true;
    else if (chatArgs[0] === fieldData.newWheelCmd) newWheelCmd = true;
    else return;
  };

  if (hasPerm) {
    if (spinCommand) {
      const user = chatArgs.length > 1 ? chatArgs[1].replace('@', '') : '';
      //  const user  = (words.length > 1 && Utils.isString(words[1])) ? words[1].replace('@', '') : '';
      startSpin({
        user: user,
        prizeList: prizeWheelSegments
      }).then((i) => console.log('RESULT ', i));
    } else if (showWheelCmd) showWheel();
    else if (hideWheelCmd) hideWheel(true);
    else if (newWheelCmd) buildPrizeList();
  };
};
/*
ADD OTHER EVENTS HERE
TRIGGER A SPIN WITH:
    startSpin({
      user: `USERNAME`,
      prizeList: prizeWheelSegments, //PRIZE LIST OBJECT
      isTest: false //IS IT A TEST? THIS WILL DISABLE POINTS ADDING FOR EMULATIONS IF SET
    });
*/

// START Reboot0s's tools https://reboot0-de.github.io/se-tools/tutorial-Events.html
function onSubBomb(data) //function required to call the 'bombcomplete'?
{
  //  console.log(`${data.sender} just gifted ${data.amount} subs to the community!`);
};

/* EXAMPLE
    Sub bomb > 4; then wheel spin for the gifter. if wheel result has 'add points', then give all the sub recievers the point value! (The gifter is also given the points in the main code)
*/
function onSubBombComplete(data, receivers) {
  console.log(`${data.name} just gifted a sub to the following ${data.amount} people: ${receivers.join(', ')}`);
  if (data.amount >= 5) { //was the gift bomb greater or = to 5?
    //start spin for the user that gifted the subs using the default prize list.
    startSpin({
      user: data.name,
      prizeList: prizeWheelSegments, //PRIZE LIST OBJECT
      isTest: data.isTest //CHECK IF A TEST ALERT; WILL NOT GIVE POINTS IF SO
    }).then(result => {
      //if the result is has addPoints enabled
      if (result.addPoints) {
        //check that the token and scope from jebaited was valid. This is checked on widget load
        if (!fieldData.addPoints) return console.log('jebaited addPoints is disabled; points were not added.');
        //check if test event
        if (data.isTest) return console.log('Event is a Test; Points are not added.');
        //format data to give each new sub the points
        let bulkPointObject = receivers.map(username => ({
          'username': username,
          'amount': result.points
        }));
        //add points to all new subs
        jebaitedAPI.addPointsBulk(bulkPointObject).then(d => console.log(`${result.points} points added to ${data.amount} users`)).catch(e => Widget.displayError(`Could Not Add ${result.points} to ${data.amount} users: ${e.error ? e.error : e}`));
      };
    });
  };
};
/* EXAMPLE FOLLOWER SPIN */
function onFollow(data) {
  startSpin({
    user: data.name,
    prizeList: prizeWheelSegments,
    isTest: data.isTest
  });
};


function onWidgetLoad(obj) {
  //get platform and streamer ID
  fetch(`https://api.streamelements.com/kappa/v2/channels/${obj.detail.channel.id}`).then(res => res.json()).then(profile => {
    platform = profile.provider; //get platform
    streamerUserId = platform === 'trovo' ? parseInt(profile.providerId) : profile.providerId; //trovo msg check for Number; twtich String
  });

  fieldData = obj.detail.fieldData;
  //set true/false dropdowns
  ['sayToChat', 'showWheelOnLoad', 'playTickSound'].forEach(i => fieldData[i] = fieldData[i] === 'yes');
  //set audio
  if (fieldData.backgroundSound) fieldData.backgroundSound = new Audio(fieldData.backgroundSound);

  buildPrizeList();

  //Jebaited API CHECK
  if (fieldData.sayToChat || fieldData.addPoints) {
    if (fieldData.jebaitedAPIToken.length !== 24) {
      fieldData.sayToChat = false;
      fieldData.addPoints = false;
      Widget.displayError('A jebaited option is turned on but the token is not correct');
    } else {
      jebaitedAPI = new Jebaited(fieldData['jebaitedAPIToken']);
      if (fieldData.sayToChat) Widget.wait(obj.detail.overlay.isEditorMode ? 2000 : 0).then(Widget.verifyBotMsg()).catch(e => console.log('ummm... verify error?: ', e));
      if (fieldData.addPoints) Widget.wait(obj.detail.overlay.isEditorMode ? 2500 : 500).then(Widget.verifyAddPoints()).catch(e => console.log('ummm... verify error?: ', e));
    };
  };
  //Check background sound, and set volume
  if (!fieldData.backgroundSound) fieldData.backgroundSound = false; //Prevent audio call with no source;
  else fieldData.backgroundSound.volume = fieldData.backgroundSoundVolume;
  //show on screen?
  if (fieldData.showWheelOnLoad) showWheel();
  //Set video/image position
  let updateCanvas = () => {
    let canvas = $("#canvas");
    /* ADVANCED OVERRIDE IF NEEDED TO CENTER VIDEO OR IMAGE */
    let videoOffsetX = 0,
      videoOffsetY = 0,
      imageOffsetX = 0,
      imageOffsetY = 0;
    //offset for jay's non centered video :)
    if (fieldData.foregroundVideo === 'https://raw.githubusercontent.com/pjonp/pjTestBot/master/modules/.SE_Overlays/chatterWheel/assets/JayniusGamingTV_demo.webm') {
      videoOffsetX = 1 * fieldData.wheelSize / 900,
        videoOffsetY = 5 * fieldData.wheelSize / 900;
    };
    //check and position overlay video
    if (!fieldData.foregroundVideo) $("#video-center-piece").html('')
    else {
      $("#video-center-piece video").css('left', `${(canvas.width() - $("#video-center-piece video").width())/2 + videoOffsetX}px`);
      $("#video-center-piece video").css('top', `${(canvas.height() - $("#video-center-piece video").height())/2 + videoOffsetY}px`);
    };
    //check and position overlay image
    if (!fieldData.foregroundImage) $("#image-center-piece").html('');
    else {
      $("#image-center-piece img").css('left', `${(canvas.width() - $("#image-center-piece img").width())/2 + imageOffsetX}px`);
      $("#image-center-piece img").css('top', `${(canvas.height() - $("#image-center-piece img").height())/2 + imageOffsetY}px`);
    };
  };
  //set video and image positions on DOM load; then update again in case code beats browser
  $(() => updateCanvas()); //DOM ready
  setTimeout(() => updateCanvas(), 10000); //force update after loaded for 10 seconds; fixes position error.
  //"Animated gradient webcam frame" by Kagrayz
  if (fieldData.mask && fieldData.mask !== 'none') buildGradient();
  else $("#frame").html('');
};
// END Reboot0s's tools

function buildPrizeList() {
  //clear prizeList
  prizeWheelSegments = [];
  //Build Add-on FD objects (wheel segments)
  for (let i = 1; i <= 51; i++) { //get segment info
    if (!fieldData[`segment${i}_wheelText`]) continue; //skip empty segments
    let bgColor, fontColor, styleMatchTarget = parseInt(fieldData[`segment${i}_styleMatch`]);
    //SET COLORS
    if (styleMatchTarget > 0) { //try to match the settings from other segment if set
      try {
        let targetSegment = prizeWheelSegments[styleMatchTarget - 1];
        bgColor = targetSegment.segmentBgColor;
        fontColor = targetSegment.fontColor;
      } catch {
        styleMatchTarget = 0;
        console.error('Segment Target Does Not Exist');
        Widget.displayError(`Target for Segment ${i} does not exist and has been set to a random color.`);
      };
    };

    if (!styleMatchTarget) { //verfiy colors are valid or set to random
      bgColor = tinycolor(fieldData[`segment${i}_bgColor`]).isValid() ? fieldData[`segment${i}_bgColor`] : tinycolor.random().toHexString();
      fontColor = tinycolor(fieldData[`segment${i}_fontColor`]).isValid() ? fieldData[`segment${i}_fontColor`] : tinycolor.mostReadable(bgColor, [bgColor], {
        includeFallbackColors: true
      }).toHexString(); // white or black
    };

    if (platform === 'trovo' && fieldData[`segment${i}_addPoints`] === 'yes') {
      fieldData[`segment${i}_addPoints`] = false;
      fieldData.addPoints = false;
      Widget.displayError(`Loyality Points for Trovo are not yet supported. Setting Disabled.`);
    };
    fieldData[`segment${i}_wheelText`] = fieldData[`segment${i}_wheelText`].replace(/\\n/g, '\n'); // 'de-escape the \ for multi-line' :) thanks Reboot0
    //***** WHEEL OBJECT !!!!
    prizeWheelSegments.push({ //build wheel object
      text: fieldData[`segment${i}_wheelText`],
      res: fieldData[`segment${i}_resText`],
      size: fieldData[`segment${i}_size`],
      segmentBgColor: bgColor,
      addPoints: fieldData[`segment${i}_addPoints`] === 'yes',
      points: fieldData[`segment${i}_points`] || 5,
      fontColor: fontColor,
      fontFamily: fieldData[`segment${i}_fontFamily`] || fieldData.fontFamily, //not used; all segments have same font
      fontSize: fieldData[`segment${i}_fontSize`] || fieldData.fontSize, //not used; all segments have same font size
    });
    //build center images; first check if a default image is include. Required for canvas building!
    if (!fieldData.foregroundImage) {
      //if no default image AND user tried to use a custom image; show an error.
      if (fieldData[`segment${i}_bgImage`]) Widget.displayError(`Custom Images For Segments Requires A Default Image In The Visual Settings Tab`);
    } else {
      //if there is a default image check if user wants default or override
      //if there is an override, enable the image rotation and add the override image
      if (fieldData[`segment${i}_bgImage`]) {
        changeCenterImage = true;
        centerImages.push(fieldData[`segment${i}_bgImage`]);
        //otherwise set image to default
      } else centerImages.push(fieldData.foregroundImage);
    };
    //enable points if a segment is enabled
    if (!fieldData.addPoints && fieldData[`segment${i}_addPoints`] === 'yes') fieldData.addPoints = true;
  };
  //error check; wheel needs at least 1 thing :)
  if (prizeWheelSegments.length < 2) Widget.displayError('2 segments are required!', true); //minimum 2 segments rquired.
};


//build wheel function
const buildWheel = (prizeList, realSpin = true) => {
  //waiting is opposite of real spin
  waitingWheel = !realSpin;
  if (prizeList.length < 0) return;
  //get wheel canvas, center point, and math the "segment size";
  let canvas = document.getElementById('canvas'),
    ctx = canvas.getContext('2d'),
    canvasCenter = canvas.height / 2,
    defaultSegSize = prizeList.reduce((total, num) => total + (!num.size ? 1 : num.size), 0);
  //build each segment on the wheel
  prizeSegments = prizeList.map(i => {
    //segment gradient
    let radGradient = ctx.createRadialGradient(canvasCenter, canvasCenter, 0, canvasCenter, canvasCenter, fieldData.wheelSize);
    //segment gradient
    radGradient.addColorStop(0, wheelGlow);
    radGradient.addColorStop(wheelGlowAmount, i.segmentBgColor);
    //final segment Object
    let segmentOBJ = {
      text: i.text,
      fillStyle: radGradient,
      textFontFamily: i.fontFamily,
      textFontSize: i.fontSize,
      textFillStyle: i.fontColor
    };
    //set segment size
    if (i.size > 0) segmentOBJ.size = 360 / defaultSegSize * i.size;
    return segmentOBJ;
  });
  //randomize the power and duration
  randomSpins = RandomInt((fieldData.spins - 3), (fieldData.spins + 4)),
    randomTime = RandomInt((fieldData.duration - 3), (fieldData.duration + 4));
  wheelAngle = theWheel ? parseInt(theWheel.rotationAngle % 360) : wheelAngle;

  let wheelAnimationObj;
  //set "spin mode"
  if (realSpin) {
    wheelAnimationObj = {
      'type': 'spinToStop',
      'duration': randomTime,
      'spins': randomSpins,
      'easing': 'Power4.easeOut'
    };
    //set 'waiting mode'
  } else {
    wheelAnimationObj = {
      'type': 'spinOngoing',
      'spins': fieldData.movingWheelSpeed,
      'duration': 180,
    }
  };

  return new Winwheel({
    'outerRadius': fieldData.wheelSize / 2,
    'innerRadius': fieldData.innerRadius / 100 * (fieldData.wheelSize / 2),
    'textFontSize': fieldData.fontSize,
    'textDirection': fieldData.textDirection,
    'textAlignment': fieldData.textAlignment,
    'textOrientation': fieldData.textOrientation,
    'textMargin': fieldData.textMargin,
    'numSegments': prizeSegments.length,
    'segments': prizeSegments,
    'pointerAngle': pointerAngle,
    'rotationAngle': wheelAngle,
    'animation': wheelAnimationObj
  });
};

const startSpin = (spinObj) => {
  return new Promise((res, rej) => {
    if (wheelSpinning) gameQueue.push([spinObj, res, rej]);
    else {
      wheelSpinning = true;

      if (typeof spinObj[1] === 'function') {
        res = spinObj[1];
        rej = spinObj[2];
        spinObj = spinObj[0];
      };

      showWheel().then(async () => {
        theWheel = buildWheel(spinObj.prizeList);
        $('#username-text').html(spinObj.user);
        await Widget.wait(spinDelay * 1000);
        if (fieldData.playTickSound || changeCenterImage) theWheel.animation.callbackSound = onTick;
        theWheel.startAnimation();
        if (fieldData.backgroundSound) playBackgroundSound();
        Widget.wait(randomTime * 1000 + 100).then(() => endSpin(spinObj)).then(res);
      });
    };
  });
};

const endSpin = (spinObj) => {
  return new Promise((res, rej) => {
    tickSound.pause();
    tickSound.currentTime = 0;
    //    wheelAngle = parseInt(theWheel.rotationAngle % 360);
    //get winner and make wheel pretty
    try {
      let winningSegmentNumber = theWheel.getIndicatedSegmentNumber(),
        canvas = document.getElementById('canvas'),
        ctx = canvas.getContext('2d'),
        canvasCenter = canvas.height / 2,
        radGradient = ctx.createRadialGradient(canvasCenter, canvasCenter, 0, canvasCenter, canvasCenter, fieldData.wheelSize); // x0,y0,r0,x1,y1,r1

      wheelPrize = theWheel.getIndicatedSegment().text;
      radGradient.addColorStop(0, spinEndBgColor1);
      radGradient.addColorStop(wheelGlowAmount, spinEndBgColor2);
      for (let i = 1; i < theWheel.segments.length; i++) {
        if (i !== winningSegmentNumber) {
          theWheel.segments[i].fillStyle = radGradient;
          theWheel.segments[i].textFillStyle = spinEndFontColor;
        };
      };
      theWheel.draw();
    } catch {
      wheelPrize = ':shrug: something broke.'
    };
    let segmentIndex = spinObj.prizeList.findIndex(i => i.text === wheelPrize),
      prizeRes = spinObj.prizeList[segmentIndex].res || wheelPrize.replace(/\\n/g, '\n'),
      chatMessage = fieldData.chatResponse.replace(/{res}/g, prizeRes).replace(/{user}/g, spinObj.user).replace(/{points}/g, spinObj.prizeList[segmentIndex].points);
    //add points
    if (spinObj.prizeList[segmentIndex].addPoints && spinObj.user) Widget.addPoints(spinObj.user, spinObj.prizeList[segmentIndex].points, spinObj.isTest);

    //delay chat response
    Widget.wait(fieldData.chatResponseDelay * 1000).then(() => {
      Widget.say(chatMessage)
      spinObj.prizeList[segmentIndex].user = spinObj.user;
      res(spinObj.prizeList[segmentIndex]);
    });
    //check if done
    Widget.wait(fieldData.gameOverDelay * 1000).then(() => {
      if (fieldData.backgroundSound) {
        fieldData.backgroundSound.pause();
        fieldData.backgroundSound.currentTime = 0;
      };
      wheelSpinning = false;
      $('#username-text').html('');
      if (gameQueue.length === 0) {
        console.log('Games Over');
        if (hideWheelAfterSpin) hideWheel()
      } else startSpin(gameQueue.shift()).then(() => res(spinObj.prizeList[segmentIndex]));
    });
  });
};
//tick sound
const onTick = () => {
  //get wheel position (offset 1 for Array data); send that to the image set function to set the inner image
  if (changeCenterImage) setCurrentImage(theWheel.getIndicatedSegmentNumber() - 1); //combine functions
  //is the tick sound enabled and is it NOT the 'waiting wheel'?
  if (fieldData.playTickSound && !waitingWheel) {
    tickSound.currentTime = 0;
    tickSound.play();
  };
  return;
};
//changing center image
function setCurrentImage(seg) {
  let currentImg = document.getElementById('wheelCenterImage'); //refactor out
  //prevent gifs from restarting every tick if no change.
  if (currentImg.src !== centerImages[seg]) currentImg.src = centerImages[seg];
};
//background sound
const playBackgroundSound = () => {
  if (!fieldData.backgroundSound) return; //redundant?
  fieldData.backgroundSound.currentTime = 0;
  fieldData.backgroundSound.play();
};
//"Animated gradient webcam frame" by Kagrayz
const buildGradient = () => {
  if (fieldData.mask) {
    let maskUrl = fieldData.mask + (fieldData.cacheMask ? '' : '?_nocache=' + new Date().getTime());
    $('#frame')
      .css('width', `${fieldData.wheelSize+fieldData.gradientOverride}px`)
      .css('height', `${fieldData.wheelSize+fieldData.gradientOverride}px`)
      .css('left', `${-1*fieldData.gradientOverride/2}px`)
      .css('top', `${-1*fieldData.gradientOverride/2}px`)
      .css('mask-image', 'url(' + maskUrl + ')')
      .css('-webkit-mask-image', 'url(' + maskUrl + ')');
  };
};
//show/hide wheel functions
const showWheel = () => {
  return new Promise((res, rej) => {
    if (wheelOnScreen) res();
    else {
      document.getElementById('container').style.opacity = 1;
      theWheel = buildWheel(prizeWheelSegments, false);
      if (fieldData.movingWheelSpeed > 0) {
        theWheel.startAnimation();
        if (changeCenterImage) theWheel.animation.callbackSound = onTick;
      };
      animateCSS('#container', fieldData.animationIn).then(() => {
        wheelOnScreen = true;
      }).then(res);
    };
  });
};
const hideWheel = (forceHide = false) => {
  if (!wheelOnScreen) return;
  wheelOnScreen = false
  animateCSS('#container', fieldData.animationOut).then(target => {
    target.style.opacity = 0;
    wheelOnScreen = false;
    theWheel.clearCanvas();
    if (wheelSpinning && !forceHide) showWheel(); //allows !hidewheel to work (force hide) but doesn't prevent respins when triggered during animation window
  });
};
//Animate.css library example :)
const animateCSS = (element, animation, prefix = 'animate__') => {
  return new Promise((resolve, reject) => {
    const animationName = `${prefix}${animation}`;
    const node = document.querySelector(element);
    node.classList.add(`${prefix}animated`, animationName);

    function handleAnimationEnd(event) {
      event.stopPropagation();
      node.classList.remove(`${prefix}animated`, animationName);
      resolve(node);
    };
    node.addEventListener('animationend', handleAnimationEnd, {
      once: true
    });
  });
};
