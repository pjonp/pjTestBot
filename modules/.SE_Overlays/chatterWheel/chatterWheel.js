/*
Chatter Wheel by pjonp

Version 1.0.0

NOTE: There are (2) json files for settings: simple and advanced
      If you are reading this to edit the code; please review the options available with the advanced field settings:
      https://github.com/pjonp/pjTestBot/tree/master/modules/.SE_Overlays/chatterWheel
*/
const randomInt = (min, max) => Math.floor((Math.random() * (max - min) + min));
let theWheel, channelName, fieldData, cooldown, spins, wheelSize, textSize, wheelSpinning = false,
  chatters = [],
  minAmount, maxAmount, goalProgress = 0,
  goalTrigger = 0,
  gameQueue = 0,
  maxChatters = 0,
  jebaitedAPIToken, sayToChat = true,
  chatResponse, spinCommand, gameOverDelay, spinPrize, spinPrizeCommand, tipMultipler, chatResponseDelay,
  multipleSpins, soundEffect, pointerAngle, playSound, removeWinners, clearListAfterSpins, wheelAngle = 0,
  videoOffsetX, videoOffsetY, imageOffsetX, imageOffsetY,
  textFontFamily, wheelShowCommand, wheelHideCommand, wheelClearCommand,
  clearPreviousWinners = false,
  ignoredChatters = [],
  defaultIngoredChatters = [],
  wheelOnScreen = false,
  spinCommandOverrides = 0,
  triggerToJoin = false,
  triggerToJoinCommand,
  triggerToJoinPhrase;

window.addEventListener('onEventReceived', function(obj) {
  //Test Button
  if (obj.detail.event.listener === 'widget-button' && obj.detail.event.field === 'testButton') {
    chatters = [...testData];
    theWheel = buildWheel();
    $("#container").removeClass("hide").addClass("show");
    wheelOnScreen = true;
    return;
  };
  const skippable = ["bot:counter", "event:test", "event:skip"]; //Array of events coming to widget that are not queued so they can come even queue is on hold
  if (skippable.indexOf(obj.detail.listener) !== -1) return;

  //Broadcaster Commands
  if (obj.detail.listener === "message") {
    let data = obj.detail.event.data;
    if (!checkPrivileges(data)) {
      return;
    } else {
      if (data.userId === data.tags['room-id']) { //Broadcaster
        if (data.text === spinCommand) {
          if (multipleSpins && wheelSpinning) {
            spinCommandOverrides++;
            return;
          };
          goalProgress += goalTrigger; //free spin
          goalTrigger = randomInt(minAmount, maxAmount);
          startSpin();
        } else if (data.text === wheelShowCommand) {
          theWheel = buildWheel();
          $("#container").removeClass("hide").addClass("show");
          wheelOnScreen = true;
        } else if (data.text === wheelHideCommand) {
          $("#container").removeClass("show").addClass("hide");
          wheelOnScreen = false;
        } else if (data.text.startsWith(spinPrizeCommand)) {
          spinPrize = data.text.replace(spinPrizeCommand, '')
          sayMessage(`Spin Wheel Prize has been set to: ${spinPrize}`);
        } else if (data.text === wheelClearCommand) {
          chatters = []
          if (clearPreviousWinners) ignoredChatters = [...defaultIngoredChatters];
          theWheel = buildWheel();
        } else if (data.text.startsWith(triggerToJoinCommand)) {
          let msg = data.text.split(' ');
          msg.shift();
          if (msg.length > 0) {
            chatters = [];
            buildWheel();
            triggerToJoin = true;
            triggerToJoinPhrase = msg.join(' ');
            res = `Giveaway mode enabled! To join type this in chat: ${triggerToJoinPhrase}`
          } else {
            triggerToJoin = false;
            res = `Giveaway mode disabled! ${triggerToJoinCommand} needs a trigger! e.g. ${triggerToJoinCommand} ticket`
          }
          sayMessage(res)
        }
      };

      //Build Chatter List
      if (triggerToJoin && !data.text.toLowerCase().includes(triggerToJoinPhrase.toLowerCase())) {
        return;
      }

      if (ignoredChatters.some(i => i.toLowerCase() === data.displayName.toLowerCase())) return;
      let chatterPosition = chatters.findIndex(i => i.text === data.displayName),
        hexColor = data.displayColor ? data.displayColor : tinycolor.random().toHexString(),
        chatterObj = {
          text: data.displayName,
          fillStyle: hexColor,
          time: data.time,
          userID: data.userId
        };
      if (chatterPosition > -1) chatters.splice(chatterPosition, 1);
      chatters.push(chatterObj)
      if (chatters.length > maxChatters) chatters.shift();
    };
    if (wheelOnScreen && !wheelSpinning) {
      buildWheel();
    };
    return;

    //Look for tips & cheers
  } else if (obj.detail.listener === 'tip-latest' || obj.detail.listener === 'cheer-latest') {
    if (triggerToJoin || fieldData.listener === 'chatCommandOnly') {
      return;
    } else if (fieldData.listener === 'tipsAndCheers') { //Not Used
      goalProgress += obj.detail.listener === 'tip-latest' ? obj.detail.event.amount * tipMultipler : obj.detail.event.amount;
    } else if (obj.detail.listener === fieldData.listener) {
      goalProgress += obj.detail.event.amount
    };
    if (goalProgress < goalTrigger) return;
    startSpin();
  };
});

window.addEventListener('onWidgetLoad', function(obj) {
  channelName = obj["detail"]["channel"]["username"];
  fieldData = obj.detail.fieldData;
  //Get all the field data
  jebaitedAPIToken = fieldData.jebaitedAPITokenFD;
  sayToChat = fieldData.sayToChatFD === 'yes';
  chatResponse = fieldData.chatResponseFD;
  spinCommand = fieldData.spinCommandFD || '!spin';
  spinPrizeCommand = fieldData.spinPrizeCommandFD || '!spinprize';
  spinPrize = fieldData.spinPrizeFD || 'nothing';
  wheelShowCommand = fieldData.wheelShowCommandFD || '!showwheel';
  wheelHideCommand = fieldData.wheelHideCommandFD || '!hidewheel';
  wheelClearCommand = fieldData.wheelClearCommandFD || '!clearwheel';
  clearPreviousWinners = fieldData.clearPreviousWinnersFD === 'yes';
  triggerToJoin = fieldData.triggerToJoinFD === 'yes';
  triggerToJoinCommand = fieldData.triggerToJoinCommandFD || '!wheelword';


  chatResponseDelay = fieldData.chatResponseDelayFD || 5;

  gameOverDelay = fieldData.gameOverDelayFD || 5;
  ignoredChatters = fieldData.ignoredChattersFD.replace(/ /g, '').split(',') || [];
  removeWinners = fieldData.removeWinnersFD === 'yes';
  clearListAfterSpins = fieldData.clearListAfterSpinsFD === 'yes';
  textFontFamily = fieldData.fontNameFD;
  videoOffsetX = fieldData.videoOffsetXFD || 1;
  videoOffsetY = fieldData.videoOffsetYFD || 5;
  imageOffsetX = fieldData.imageOffsetXFD || 0;
  imageOffsetY = fieldData.imageOffsetYFD || 0;

  pointerAngle = fieldData.pointerAngleFD || 0;
  //  tipMultipler = fieldData.tipMultiplerFD || 100; //not used
  multipleSpins = fieldData.multipleSpinsFD === 'yes';
  playSound = fieldData.playSoundFD === 'yes';
  soundEffect = new Audio(fieldData.soundEffectFD || '');


  cooldown = fieldData.duration || 20;
  spins = fieldData.spins || 15;
  wheelSize = fieldData.wheelSize || 900;
  textSize = fieldData.textSize;
  minAmount = fieldData.minAmountFD || 5;
  maxAmount = fieldData.maxAmountFD || minAmount;
  goalTrigger = randomInt(minAmount, maxAmount);
  maxChatters = fieldData.maxChattersFD || 25;
  clearPreviousWinners = fieldData.clearPreviousWinnersFD === 'yes';

  if (!jebaitedAPIToken || jebaitedAPIToken === 'need: botMsg') sayToChat = false; //Prevent API call with no token;
  if (!soundEffect) playSound = false; //Prevent audio call with no source;

  defaultIngoredChatters = [...ignoredChatters];



  if (fieldData.showWheelOnLoadFD === 'yes') {
    $("#container").css('opacity', '1');
    //  chatters = [...testData];
    //  theWheel = buildWheel();
    wheelOnScreen = true;
  };

  let updateCanvas = () => { //Set video/image position
    let canvas = $("#canvas");
    if (!fieldData.foregroundVideo) {
      $("#video-center-piece").html('');
    } else {
      $("#video-center-piece").css('left', `${(canvas.width() - $("#video-center-piece video").width())/2 + videoOffsetX}px`);
      $("#video-center-piece").css('top', `${(canvas.height() - $("#video-center-piece video").height())/2 + videoOffsetY}px`);
    };
    if (!fieldData.foregroundImage) {
      $("#image-center-piece").html('');
    } else {
      $("#image-center-piece img").css('left', `${(canvas.width() - $("#image-center-piece img").width())/2 + imageOffsetX}px`);
      $("#image-center-piece img").css('top', `${(canvas.height() - $("#image-center-piece img").height())/2 + imageOffsetY}px`);
    };
  };

  $(() => updateCanvas()); //DOM ready
  setTimeout(() => updateCanvas(), 10000); //force update after loaded for 10 seconds

});

const buildWheel = () => {
  if (chatters.length < 0) return;
  let canvas = document.getElementById('canvas'),
    ctx = canvas.getContext('2d'),
    canvasCenter = canvas.height / 2,
    chatterSegments = chatters.map(i => {
      let radGradient = ctx.createRadialGradient(canvasCenter, canvasCenter, 0, canvasCenter, canvasCenter, wheelSize),
        hexColor = i.fillStyle ? i.fillStyle : i.fillStyle = tinycolor.random().toHexString();
      radGradient.addColorStop(0, "white");
      radGradient.addColorStop(0.5, i.fillStyle);
      return {
        text: i.text, //.slice(0,18), //can't shorten names if removing winners
        fillStyle: radGradient,
        textFontFamily: textFontFamily,
        textFillStyle: tinycolor.mostReadable(i.fillStyle, [i.fillStyle], {
          includeFallbackColors: true
        }).toHexString() // white or black
      };
    })
  return new Winwheel({
    'outerRadius': wheelSize / 2, // Set outer radius so wheel fits inside the background.
    'textFontSize': textSize, // Set default font size for the segments.
    'textDirection': 'reversed',
    'textAlignment': 'outer', // Align text to outside of wheel.
    'textMargin': 20,
    'numSegments': chatterSegments.length, // Specify number of segments.
    'segments': chatterSegments, // Define segments including colour and text.
    'pointerAngle': pointerAngle,
    'animation': // Specify the animation to use.
    {
      'type': 'spinToStop',
      'duration': cooldown, // Duration in seconds.
      'spins': spins, // Default number of complete spins.
      'easing': 'Power4.easeOut'
    }
  });
};

const startSpin = () => {
  if (wheelSpinning) {
    gameQueue++;
    return;
  } else {
    theWheel = buildWheel();
    $("#container").removeClass("hide").addClass("show");
    wheelOnScreen = true;
    theWheel.rotationAngle = wheelAngle;
    theWheel.stopAnimation(false);
    if (playSound) theWheel.animation.callbackSound = playSoundEffect;
    theWheel.startAnimation();
    wheelSpinning = true;
    setTimeout(() => endSpin(), cooldown * 1000 + 100);
  };
};

const endSpin = () => {

//get winner and make wheel pretty
  let roundWinner
  try {
    let winningSegmentNumber = theWheel.getIndicatedSegmentNumber(),
      canvas = document.getElementById('canvas'),
      ctx = canvas.getContext('2d'),
      canvasCenter = canvas.height / 2,
      radGradient = ctx.createRadialGradient(canvasCenter, canvasCenter, 0, canvasCenter, canvasCenter, wheelSize); // x0,y0,r0,x1,y1,r1

    roundWinner = theWheel.getIndicatedSegment().text;
    radGradient.addColorStop(0, "white");
    radGradient.addColorStop(0.5, "gray");
    for (let i = 1; i < theWheel.segments.length; i++) {
      if (i !== winningSegmentNumber) {
        theWheel.segments[i].fillStyle = radGradient;
        theWheel.segments[i].textFillStyle = 'black';
      };
    }
    theWheel.draw();
  } catch {
    roundWinner = 'No one'
  };

//check for a respin
  if (multipleSpins) {
    if (spinCommandOverrides > 0) {
      spinCommandOverrides--;
      startSpin();
    } else {
      goalProgress -= goalTrigger;
      goalTrigger = randomInt(minAmount, maxAmount);
      console.log('Goal Progress:', goalProgress);
      console.log('Goal Trigger:', goalTrigger);
      if (goalProgress < goalTrigger) gameQueue = 0;
      else startSpin();
    };
  } else {
    goalProgress = 0;
    goalTrigger = randomInt(minAmount, maxAmount);
    console.log('Goal Trigger:', goalTrigger);
  };

//delay chat response
  setTimeout(() => {
    sayMessage(`${chatResponse.replace('{chatter}', roundWinner).replace('{user}', roundWinner).replace('{prize}', spinPrize)}`)
  }, chatResponseDelay * 1000);
//remove winner if settting enabled
  if (removeWinners) {
    ignoredChatters.push(roundWinner);
    chatters.splice(chatters.findIndex(i => i.text === roundWinner), 1);
  };
//check if done
  setTimeout(() => {
    wheelSpinning = false;
    if (gameQueue === 0) {
      console.log('Games Over');
      if (clearListAfterSpins) chatters = [];
      $("#container").removeClass("show").addClass("hide");
      wheelOnScreen = false;
      wheelAngle = 0;
      triggerToJoin = false;
    } else {
      gameQueue--;
      console.log('New Game');
      wheelAngle = parseInt(theWheel.rotationAngle % 360);
      startSpin();
    };
  }, gameOverDelay * 1000);
};

const sayMessage = (message) => {
  console.log(message);
  if (!sayToChat) return;
  message = encodeURIComponent(message);
  fetch(`https://api.jebaited.net/botMsg/${jebaitedAPIToken}/${message}`)
    .catch(error => {
      console.error(`Error sending message to chat`)
    });
};

const playSoundEffect = () => {
  //  soundEffect.pause();
  soundEffect.currentTime = 0;
  soundEffect.play();
};

const checkPrivileges = (data) => {
  let required = fieldData.privileges;
  let userState = {
    'mod': parseInt(data.tags.mod),
    'sub': parseInt(data.tags.subscriber),
    'vip': (data.tags.badges.indexOf("vip") !== -1),
    'badges': {
      'broadcaster': (data.userId === data.tags['room-id'])
    }
  };
  if (userState.badges.broadcaster) return true;
  else if (required === "mods" && userState.mod) return true;
  else if (required === "vips" && (userState.mod || userState.vip)) return true;
  else if (required === "subs" && (userState.mod || userState.vip || userState.sub)) return true;
  else if (required === "everybody") return true;
  else return false;
};

let testData = [{
    text: "user"
  },
  {
    text: "username"
  },
  {
    text: "long_username_test"
  },
  {
    text: "USER2"
  },
  {
    text: "USERNAME2"
  },
  {
    text: "LONG_USERNAME_TEST2"
  },
  {
    text: "user3"
  },
  {
    text: "username3"
  },
  {
    text: "long_username_test3"
  },
  {
    text: "USER4"
  },
  {
    text: "USERNAME4"
  },
  {
    text: "LONG_USERNAME_TEST4"
  }
];



//winWheel.js 2.8.0
/*
    Winwheel.js, by Douglas McKechie @ www.dougtesting.net
    See website for tutorials and other documentation.
    The MIT License (MIT)
    Copyright (c) 2012-2019 Douglas McKechie
    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:
    The above copyright notice and this permission notice shall be included in all
    copies or substantial portions of the Software.
    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
    SOFTWARE.
*/
function Winwheel(a, c) {
  defaultOptions = {
    canvasId: "canvas",
    centerX: null,
    centerY: null,
    outerRadius: null,
    innerRadius: 0,
    numSegments: 1,
    drawMode: "code",
    rotationAngle: 0,
    textFontFamily: "Arial",
    textFontSize: 20,
    textFontWeight: "bold",
    textOrientation: "horizontal",
    textAlignment: "center",
    textDirection: "normal",
    textMargin: null,
    textFillStyle: "black",
    textStrokeStyle: null,
    textLineWidth: 1,
    fillStyle: "silver",
    strokeStyle: "black",
    lineWidth: 1,
    clearTheCanvas: !0,
    imageOverlay: !1,
    drawText: !0,
    pointerAngle: 0,
    wheelImage: null,
    imageDirection: "N",
    responsive: !1,
    scaleFactor: 1
  };
  for (var b in defaultOptions) this[b] = null != a && "undefined" !== typeof a[b] ? a[b] : defaultOptions[b];
  if (null != a)
    for (var d in a) "undefined" === typeof this[d] && (this[d] = a[d]);
  this.canvasId ? (this.canvas = document.getElementById(this.canvasId)) ? (null == this.centerX && (this.centerX = this.canvas.width / 2), null == this.centerY && (this.centerY = this.canvas.height / 2), null == this.outerRadius && (this.outerRadius = this.canvas.width < this.canvas.height ? this.canvas.width / 2 - this.lineWidth : this.canvas.height /
    2 - this.lineWidth), this.ctx = this.canvas.getContext("2d")) : this.ctx = this.canvas = null : this.ctx = this.canvas = null;
  this.segments = Array(null);
  for (b = 1; b <= this.numSegments; b++) this.segments[b] = null != a && a.segments && "undefined" !== typeof a.segments[b - 1] ? new Segment(a.segments[b - 1]) : new Segment;
  this.updateSegmentSizes();
  null === this.textMargin && (this.textMargin = this.textFontSize / 1.7);
  this.animation = null != a && a.animation && "undefined" !== typeof a.animation ? new Animation(a.animation) : new Animation;
  null != a && a.pins &&
    "undefined" !== typeof a.pins && (this.pins = new Pin(a.pins));
  "image" == this.drawMode || "segmentImage" == this.drawMode ? ("undefined" === typeof a.fillStyle && (this.fillStyle = null), "undefined" === typeof a.strokeStyle && (this.strokeStyle = "red"), "undefined" === typeof a.drawText && (this.drawText = !1), "undefined" === typeof a.lineWidth && (this.lineWidth = 1), "undefined" === typeof c && (c = !1)) : "undefined" === typeof c && (c = !0);
  this.pointerGuide = null != a && a.pointerGuide && "undefined" !== typeof a.pointerGuide ? new PointerGuide(a.pointerGuide) :
    new PointerGuide;
  this.responsive && (winwheelToDrawDuringAnimation = this, this._originalCanvasWidth = this.canvas.width, this._originalCanvasHeight = this.canvas.height, this._responsiveScaleHeight = this.canvas.dataset.responsivescaleheight, this._responsiveMinWidth = this.canvas.dataset.responsiveminwidth, this._responsiveMinHeight = this.canvas.dataset.responsiveminheight, this._responsiveMargin = this.canvas.dataset.responsivemargin, window.addEventListener("load", winwheelResize), window.addEventListener("resize", winwheelResize));
  if (1 == c) this.draw(this.clearTheCanvas);
  else if ("segmentImage" == this.drawMode)
    for (winwheelToDrawDuringAnimation = this, winhweelAlreadyDrawn = !1, b = 1; b <= this.numSegments; b++) null !== this.segments[b].image && (this.segments[b].imgData = new Image, this.segments[b].imgData.onload = winwheelLoadedImage, this.segments[b].imgData.src = this.segments[b].image)
}
Winwheel.prototype.updateSegmentSizes = function() {
  if (this.segments) {
    for (var a = 0, c = 0, b = 1; b <= this.numSegments; b++) null !== this.segments[b].size && (a += this.segments[b].size, c++);
    b = 360 - a;
    a = 0;
    0 < b && (a = b / (this.numSegments - c));
    c = 0;
    for (b = 1; b <= this.numSegments; b++) this.segments[b].startAngle = c, c = this.segments[b].size ? c + this.segments[b].size : c + a, this.segments[b].endAngle = c
  }
};
Winwheel.prototype.clearCanvas = function() {
  this.ctx && this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
};
Winwheel.prototype.draw = function(a) {
  this.ctx && ("undefined" !== typeof a ? 1 == a && this.clearCanvas() : this.clearCanvas(), "image" == this.drawMode ? (this.drawWheelImage(), 1 == this.drawText && this.drawSegmentText(), 1 == this.imageOverlay && this.drawSegments()) : "segmentImage" == this.drawMode ? (this.drawSegmentImages(), 1 == this.drawText && this.drawSegmentText(), 1 == this.imageOverlay && this.drawSegments()) : (this.drawSegments(), 1 == this.drawText && this.drawSegmentText()), "undefined" !== typeof this.pins && 1 == this.pins.visible &&
    this.drawPins(), 1 == this.pointerGuide.display && this.drawPointerGuide())
};
Winwheel.prototype.drawPins = function() {
  if (this.pins && this.pins.number) {
    var a = this.centerX * this.scaleFactor,
      c = this.centerY * this.scaleFactor,
      b = this.outerRadius * this.scaleFactor,
      d = this.pins.outerRadius,
      e = this.pins.margin;
    this.pins.responsive && (d = this.pins.outerRadius * this.scaleFactor, e = this.pins.margin * this.scaleFactor);
    for (var t = 360 / this.pins.number, h = 1; h <= this.pins.number; h++) this.ctx.save(), this.ctx.strokeStyle = this.pins.strokeStyle, this.ctx.lineWidth = this.pins.lineWidth, this.ctx.fillStyle = this.pins.fillStyle,
      this.ctx.translate(a, c), this.ctx.rotate(this.degToRad(h * t + this.rotationAngle)), this.ctx.translate(-a, -c), this.ctx.beginPath(), this.ctx.arc(a, c - b + d + e, d, 0, 2 * Math.PI), this.pins.fillStyle && this.ctx.fill(), this.pins.strokeStyle && this.ctx.stroke(), this.ctx.restore()
  }
};
Winwheel.prototype.drawPointerGuide = function() {
  if (this.ctx) {
    var a = this.centerX * this.scaleFactor,
      c = this.centerY * this.scaleFactor,
      b = this.outerRadius * this.scaleFactor;
    this.ctx.save();
    this.ctx.translate(a, c);
    this.ctx.rotate(this.degToRad(this.pointerAngle));
    this.ctx.translate(-a, -c);
    this.ctx.strokeStyle = this.pointerGuide.strokeStyle;
    this.ctx.lineWidth = this.pointerGuide.lineWidth;
    this.ctx.beginPath();
    this.ctx.moveTo(a, c);
    this.ctx.lineTo(a, -(b / 4));
    this.ctx.stroke();
    this.ctx.restore()
  }
};
Winwheel.prototype.drawWheelImage = function() {
  if (null != this.wheelImage) {
    var a = this.centerX * this.scaleFactor,
      c = this.centerY * this.scaleFactor,
      b = this.wheelImage.width * this.scaleFactor,
      d = this.wheelImage.height * this.scaleFactor,
      e = a - b / 2,
      t = c - d / 2;
    this.ctx.save();
    this.ctx.translate(a, c);
    this.ctx.rotate(this.degToRad(this.rotationAngle));
    this.ctx.translate(-a, -c);
    this.ctx.drawImage(this.wheelImage, e, t, b, d);
    this.ctx.restore()
  }
};
Winwheel.prototype.drawSegmentImages = function() {
  if (this.ctx) {
    var a = this.centerX * this.scaleFactor,
      c = this.centerY * this.scaleFactor;
    if (this.segments)
      for (var b = 1; b <= this.numSegments; b++) {
        var d = this.segments[b];
        if (d.imgData.height) {
          var e = d.imgData.width * this.scaleFactor,
            t = d.imgData.height * this.scaleFactor;
          var h = null !== d.imageDirection ? d.imageDirection : this.imageDirection;
          if ("S" == h) {
            h = a - e / 2;
            var n = c;
            var r = d.startAngle + 180 + (d.endAngle - d.startAngle) / 2
          } else "E" == h ? (h = a, n = c - t / 2, r = d.startAngle + 270 + (d.endAngle -
            d.startAngle) / 2) : "W" == h ? (h = a - e, n = c - t / 2, r = d.startAngle + 90 + (d.endAngle - d.startAngle) / 2) : (h = a - e / 2, n = c - t, r = d.startAngle + (d.endAngle - d.startAngle) / 2);
          this.ctx.save();
          this.ctx.translate(a, c);
          this.ctx.rotate(this.degToRad(this.rotationAngle + r));
          this.ctx.translate(-a, -c);
          this.ctx.drawImage(d.imgData, h, n, e, t);
          this.ctx.restore()
        } else console.log("Segment " + b + " imgData is not loaded")
      }
  }
};
Winwheel.prototype.drawSegments = function() {
  if (this.ctx && this.segments)
    for (var a = this.centerX * this.scaleFactor, c = this.centerY * this.scaleFactor, b = this.innerRadius * this.scaleFactor, d = this.outerRadius * this.scaleFactor, e = 1; e <= this.numSegments; e++) {
      var t = this.segments[e];
      var h = null !== t.fillStyle ? t.fillStyle : this.fillStyle;
      this.ctx.fillStyle = h;
      var n = null !== t.lineWidth ? t.lineWidth : this.lineWidth;
      this.ctx.lineWidth = n;
      var r = null !== t.strokeStyle ? t.strokeStyle : this.strokeStyle;
      if ((this.ctx.strokeStyle = r) || h) {
        this.ctx.beginPath();
        if (this.innerRadius) {
          var f = Math.cos(this.degToRad(t.startAngle + this.rotationAngle - 90)) * (b - n / 2);
          n = Math.sin(this.degToRad(t.startAngle + this.rotationAngle - 90)) * (b - n / 2);
          this.ctx.moveTo(a + f, c + n)
        } else this.ctx.moveTo(a, c);
        this.ctx.arc(a, c, d, this.degToRad(t.startAngle + this.rotationAngle - 90), this.degToRad(t.endAngle + this.rotationAngle - 90), !1);
        this.innerRadius ? this.ctx.arc(a, c, b, this.degToRad(t.endAngle + this.rotationAngle - 90), this.degToRad(t.startAngle + this.rotationAngle - 90), !0) : this.ctx.lineTo(a, c);
        h && this.ctx.fill();
        r && this.ctx.stroke()
      }
    }
};
Winwheel.prototype.drawSegmentText = function() {
  if (this.ctx)
    for (var a, c, b, d, e, t, h, n, r, f, l = this.centerX * this.scaleFactor, p = this.centerY * this.scaleFactor, w = this.outerRadius * this.scaleFactor, v = this.innerRadius * this.scaleFactor, y = 1; y <= this.numSegments; y++) {
      this.ctx.save();
      var g = this.segments[y];
      if (g.text) {
        a = null !== g.textFontFamily ? g.textFontFamily : this.textFontFamily;
        c = null !== g.textFontSize ? g.textFontSize : this.textFontSize;
        b = null !== g.textFontWeight ? g.textFontWeight : this.textFontWeight;
        d = null !== g.textOrientation ?
          g.textOrientation : this.textOrientation;
        e = null !== g.textAlignment ? g.textAlignment : this.textAlignment;
        t = null !== g.textDirection ? g.textDirection : this.textDirection;
        h = null !== g.textMargin ? g.textMargin : this.textMargin;
        n = null !== g.textFillStyle ? g.textFillStyle : this.textFillStyle;
        r = null !== g.textStrokeStyle ? g.textStrokeStyle : this.textStrokeStyle;
        f = null !== g.textLineWidth ? g.textLineWidth : this.textLineWidth;
        c *= this.scaleFactor;
        h *= this.scaleFactor;
        var m = "";
        null != b && (m += b + " ");
        null != c && (m += c + "px ");
        null != a && (m += a);
        this.ctx.font = m;
        this.ctx.fillStyle = n;
        this.ctx.strokeStyle = r;
        this.ctx.lineWidth = f;
        a = g.text.split("\n");
        b = -(a.length / 2 * c) + c / 2;
        "curved" != d || "inner" != e && "outer" != e || (b = 0);
        for (f = 0; f < a.length; f++) {
          if ("reversed" == t)
            if ("horizontal" == d) this.ctx.textAlign = "inner" == e ? "right" : "outer" == e ? "left" : "center", this.ctx.textBaseline = "middle", m = this.degToRad(g.endAngle - (g.endAngle - g.startAngle) / 2 + this.rotationAngle - 90 - 180), this.ctx.save(), this.ctx.translate(l, p), this.ctx.rotate(m), this.ctx.translate(-l, -p), "inner" == e ?
              (n && this.ctx.fillText(a[f], l - v - h, p + b), r && this.ctx.strokeText(a[f], l - v - h, p + b)) : "outer" == e ? (n && this.ctx.fillText(a[f], l - w + h, p + b), r && this.ctx.strokeText(a[f], l - w + h, p + b)) : (n && this.ctx.fillText(a[f], l - v - (w - v) / 2 - h, p + b), r && this.ctx.strokeText(a[f], l - v - (w - v) / 2 - h, p + b)), this.ctx.restore();
            else if ("vertical" == d) {
            this.ctx.textAlign = "center";
            this.ctx.textBaseline = "inner" == e ? "top" : "outer" == e ? "bottom" : "middle";
            m = g.endAngle - (g.endAngle - g.startAngle) / 2 - 180;
            m += this.rotationAngle;
            this.ctx.save();
            this.ctx.translate(l,
              p);
            this.ctx.rotate(this.degToRad(m));
            this.ctx.translate(-l, -p);
            var k = 0;
            "outer" == e ? k = p + w - h : "inner" == e && (k = p + v + h);
            m = c - c / 9;
            if ("outer" == e)
              for (var q = a[f].length - 1; 0 <= q; q--) {
                var u = a[f].charAt(q);
                n && this.ctx.fillText(u, l + b, k);
                r && this.ctx.strokeText(u, l + b, k);
                k -= m
              } else if ("inner" == e)
                for (q = 0; q < a[f].length; q++) u = a[f].charAt(q), n && this.ctx.fillText(u, l + b, k), r && this.ctx.strokeText(u, l + b, k), k += m;
              else if ("center" == e)
              for (k = 0, 1 < a[f].length && (k = m * (a[f].length - 1) / 2), k = p + v + (w - v) / 2 + k + h, q = a[f].length - 1; 0 <= q; q--) u = a[f].charAt(q),
                n && this.ctx.fillText(u, l + b, k), r && this.ctx.strokeText(u, l + b, k), k -= m;
            this.ctx.restore()
          } else {
            if ("curved" == d)
              for (m = 0, "inner" == e ? (m = v + h, this.ctx.textBaseline = "top") : "outer" == e ? (m = w - h, this.ctx.textBaseline = "bottom", m -= c * (a.length - 1)) : "center" == e && (m = v + h + (w - v) / 2, this.ctx.textBaseline = "middle"), k = 0, 1 < a[f].length ? (this.ctx.textAlign = "left", k = c / 10 * 4, k *= 100 / m, q = g.startAngle + ((g.endAngle - g.startAngle) / 2 - k * a[f].length / 2)) : (q = g.startAngle + (g.endAngle - g.startAngle) / 2, this.ctx.textAlign = "center"), q += this.rotationAngle,
                q -= 180, u = a[f].length; 0 <= u; u--) {
                this.ctx.save();
                var x = a[f].charAt(u);
                this.ctx.translate(l, p);
                this.ctx.rotate(this.degToRad(q));
                this.ctx.translate(-l, -p);
                r && this.ctx.strokeText(x, l, p + m + b);
                n && this.ctx.fillText(x, l, p + m + b);
                q += k;
                this.ctx.restore()
              }
          } else if ("horizontal" == d) this.ctx.textAlign = "inner" == e ? "left" : "outer" == e ? "right" : "center", this.ctx.textBaseline = "middle", m = this.degToRad(g.endAngle - (g.endAngle - g.startAngle) / 2 + this.rotationAngle - 90), this.ctx.save(), this.ctx.translate(l, p), this.ctx.rotate(m), this.ctx.translate(-l,
            -p), "inner" == e ? (n && this.ctx.fillText(a[f], l + v + h, p + b), r && this.ctx.strokeText(a[f], l + v + h, p + b)) : "outer" == e ? (n && this.ctx.fillText(a[f], l + w - h, p + b), r && this.ctx.strokeText(a[f], l + w - h, p + b)) : (n && this.ctx.fillText(a[f], l + v + (w - v) / 2 + h, p + b), r && this.ctx.strokeText(a[f], l + v + (w - v) / 2 + h, p + b)), this.ctx.restore();
          else if ("vertical" == d) {
            this.ctx.textAlign = "center";
            this.ctx.textBaseline = "inner" == e ? "bottom" : "outer" == e ? "top" : "middle";
            m = g.endAngle - (g.endAngle - g.startAngle) / 2;
            m += this.rotationAngle;
            this.ctx.save();
            this.ctx.translate(l,
              p);
            this.ctx.rotate(this.degToRad(m));
            this.ctx.translate(-l, -p);
            k = 0;
            "outer" == e ? k = p - w + h : "inner" == e && (k = p - v - h);
            m = c - c / 9;
            if ("outer" == e)
              for (q = 0; q < a[f].length; q++) u = a[f].charAt(q), n && this.ctx.fillText(u, l + b, k), r && this.ctx.strokeText(u, l + b, k), k += m;
            else if ("inner" == e)
              for (q = a[f].length - 1; 0 <= q; q--) u = a[f].charAt(q), n && this.ctx.fillText(u, l + b, k), r && this.ctx.strokeText(u, l + b, k), k -= m;
            else if ("center" == e)
              for (k = 0, 1 < a[f].length && (k = m * (a[f].length - 1) / 2), k = p - v - (w - v) / 2 - k - h, q = 0; q < a[f].length; q++) u = a[f].charAt(q), n && this.ctx.fillText(u,
                l + b, k), r && this.ctx.strokeText(u, l + b, k), k += m;
            this.ctx.restore()
          } else if ("curved" == d)
            for (m = 0, "inner" == e ? (m = v + h, this.ctx.textBaseline = "bottom", m += c * (a.length - 1)) : "outer" == e ? (m = w - h, this.ctx.textBaseline = "top") : "center" == e && (m = v + h + (w - v) / 2, this.ctx.textBaseline = "middle"), k = 0, 1 < a[f].length ? (this.ctx.textAlign = "left", k = c / 10 * 4, k *= 100 / m, q = g.startAngle + ((g.endAngle - g.startAngle) / 2 - k * a[f].length / 2)) : (q = g.startAngle + (g.endAngle - g.startAngle) / 2, this.ctx.textAlign = "center"), q += this.rotationAngle, u = 0; u < a[f].length; u++) this.ctx.save(),
              x = a[f].charAt(u), this.ctx.translate(l, p), this.ctx.rotate(this.degToRad(q)), this.ctx.translate(-l, -p), r && this.ctx.strokeText(x, l, p - m + b), n && this.ctx.fillText(x, l, p - m + b), q += k, this.ctx.restore();
          b += c
        }
      }
      this.ctx.restore()
    }
};
Winwheel.prototype.degToRad = function(a) {
  return .017453292519943295 * a
};
Winwheel.prototype.setCenter = function(a, c) {
  this.centerX = a;
  this.centerY = c
};
Winwheel.prototype.addSegment = function(a, c) {
  var b = new Segment(a);
  this.numSegments++;
  if ("undefined" !== typeof c) {
    for (var d = this.numSegments; d > c; d--) this.segments[d] = this.segments[d - 1];
    this.segments[c] = b;
    b = c
  } else this.segments[this.numSegments] = b, b = this.numSegments;
  this.updateSegmentSizes();
  return this.segments[b]
};
Winwheel.prototype.setCanvasId = function(a) {
  if (a) {
    if (this.canvasId = a, this.canvas = document.getElementById(this.canvasId)) this.ctx = this.canvas.getContext("2d")
  } else this.canvas = this.ctx = this.canvasId = null
};
Winwheel.prototype.deleteSegment = function(a) {
  if (1 < this.numSegments) {
    if ("undefined" !== typeof a)
      for (; a < this.numSegments; a++) this.segments[a] = this.segments[a + 1];
    this.segments[this.numSegments] = void 0;
    this.numSegments--;
    this.updateSegmentSizes()
  }
};
Winwheel.prototype.windowToCanvas = function(a, c) {
  var b = this.canvas.getBoundingClientRect();
  return {
    x: Math.floor(a - this.canvas.width / b.width * b.left),
    y: Math.floor(c - this.canvas.height / b.height * b.top)
  }
};
Winwheel.prototype.getSegmentAt = function(a, c) {
  var b = null,
    d = this.getSegmentNumberAt(a, c);
  null !== d && (b = this.segments[d]);
  return b
};
Winwheel.prototype.getSegmentNumberAt = function(a, c) {
  var b = this.windowToCanvas(a, c);
  var d = this.centerX * this.scaleFactor;
  var e = this.centerY * this.scaleFactor;
  var t = this.outerRadius * this.scaleFactor,
    h = this.innerRadius * this.scaleFactor;
  if (b.x > d) {
    var n = b.x - d;
    d = "R"
  } else n = d - b.x, d = "L";
  if (b.y > e) {
    var r = b.y - e;
    e = "B"
  } else r = e - b.y, e = "T";
  var f = 180 * Math.atan(r / n) / Math.PI;
  b = 0;
  n = Math.sqrt(r * r + n * n);
  "T" == e && "R" == d ? b = Math.round(90 - f) : "B" == e && "R" == d ? b = Math.round(f + 90) : "B" == e && "L" == d ? b = Math.round(90 - f + 180) : "T" == e && "L" ==
    d && (b = Math.round(f + 270));
  0 != this.rotationAngle && (d = this.getRotationPosition(), b -= d, 0 > b && (b = 360 - Math.abs(b)));
  d = null;
  for (e = 1; e <= this.numSegments; e++)
    if (b >= this.segments[e].startAngle && b <= this.segments[e].endAngle && n >= h && n <= t) {
      d = e;
      break
    } return d
};
Winwheel.prototype.getIndicatedSegment = function() {
  var a = this.getIndicatedSegmentNumber();
  return this.segments[a]
};
Winwheel.prototype.getIndicatedSegmentNumber = function() {
  var a = 0,
    c = this.getRotationPosition();
  c = Math.floor(this.pointerAngle - c);
  0 > c && (c = 360 - Math.abs(c));
  for (var b = 1; b < this.segments.length; b++)
    if (c >= this.segments[b].startAngle && c <= this.segments[b].endAngle) {
      a = b;
      break
    } return a
};
Winwheel.prototype.getCurrentPinNumber = function() {
  var a = 0;
  if (this.pins) {
    var c = this.getRotationPosition();
    c = Math.floor(this.pointerAngle - c);
    0 > c && (c = 360 - Math.abs(c));
    for (var b = 360 / this.pins.number, d = 0, e = 0; e < this.pins.number; e++) {
      if (c >= d && c <= d + b) {
        a = e;
        break
      }
      d += b
    }
    "clockwise" == this.animation.direction && (a++, a > this.pins.number && (a = 0))
  }
  return a
};
Winwheel.prototype.getRotationPosition = function() {
  var a = this.rotationAngle;
  0 <= a ? 360 < a && (a -= 360 * Math.floor(a / 360)) : (-360 > a && (a -= 360 * Math.ceil(a / 360)), a = 360 + a);
  return a
};
Winwheel.prototype.startAnimation = function() {
  if (this.animation) {
    this.computeAnimation();
    winwheelToDrawDuringAnimation = this;
    var a = Array(null);
    a[this.animation.propertyName] = this.animation.propertyValue;
    a.yoyo = this.animation.yoyo;
    a.repeat = this.animation.repeat;
    a.ease = this.animation.easing;
    a.onUpdate = winwheelAnimationLoop;
    a.onComplete = winwheelStopAnimation;
    this.tween = TweenMax.to(this, this.animation.duration, a)
  }
};
Winwheel.prototype.stopAnimation = function(a) {
  winwheelToDrawDuringAnimation && (winwheelToDrawDuringAnimation.tween && winwheelToDrawDuringAnimation.tween.kill(), winwheelStopAnimation(a));
  winwheelToDrawDuringAnimation = this
};
Winwheel.prototype.pauseAnimation = function() {
  this.tween && this.tween.pause()
};
Winwheel.prototype.resumeAnimation = function() {
  this.tween && this.tween.play()
};
Winwheel.prototype.computeAnimation = function() {
  this.animation && ("spinOngoing" == this.animation.type ? (this.animation.propertyName = "rotationAngle", null == this.animation.spins && (this.animation.spins = 5), null == this.animation.repeat && (this.animation.repeat = -1), null == this.animation.easing && (this.animation.easing = "Linear.easeNone"), null == this.animation.yoyo && (this.animation.yoyo = !1), this.animation.propertyValue = 360 * this.animation.spins, "anti-clockwise" == this.animation.direction && (this.animation.propertyValue =
    0 - this.animation.propertyValue)) : "spinToStop" == this.animation.type ? (this.animation.propertyName = "rotationAngle", null == this.animation.spins && (this.animation.spins = 5), null == this.animation.repeat && (this.animation.repeat = 0), null == this.animation.easing && (this.animation.easing = "Power3.easeOut"), this.animation._stopAngle = null == this.animation.stopAngle ? Math.floor(359 * Math.random()) : 360 - this.animation.stopAngle + this.pointerAngle, null == this.animation.yoyo && (this.animation.yoyo = !1), this.animation.propertyValue =
    360 * this.animation.spins, "anti-clockwise" == this.animation.direction ? (this.animation.propertyValue = 0 - this.animation.propertyValue, this.animation.propertyValue -= 360 - this.animation._stopAngle) : this.animation.propertyValue += this.animation._stopAngle) : "spinAndBack" == this.animation.type && (this.animation.propertyName = "rotationAngle", null == this.animation.spins && (this.animation.spins = 5), null == this.animation.repeat && (this.animation.repeat = 1), null == this.animation.easing && (this.animation.easing = "Power2.easeInOut"),
    null == this.animation.yoyo && (this.animation.yoyo = !0), this.animation._stopAngle = null == this.animation.stopAngle ? 0 : 360 - this.animation.stopAngle, this.animation.propertyValue = 360 * this.animation.spins, "anti-clockwise" == this.animation.direction ? (this.animation.propertyValue = 0 - this.animation.propertyValue, this.animation.propertyValue -= 360 - this.animation._stopAngle) : this.animation.propertyValue += this.animation._stopAngle))
};
Winwheel.prototype.getRandomForSegment = function(a) {
  var c = 0;
  if (a)
    if ("undefined" !== typeof this.segments[a]) {
      var b = this.segments[a].startAngle;
      a = this.segments[a].endAngle - b - 2;
      0 < a ? c = b + 1 + Math.floor(Math.random() * a) : console.log("Segment size is too small to safely get random angle inside it")
    } else console.log("Segment " + a + " undefined");
  else console.log("Segment number not specified");
  return c
};

function Pin(a) {
  var c = {
      visible: !0,
      number: 36,
      outerRadius: 3,
      fillStyle: "grey",
      strokeStyle: "black",
      lineWidth: 1,
      margin: 3,
      responsive: !1
    },
    b;
  for (b in c) this[b] = null != a && "undefined" !== typeof a[b] ? a[b] : c[b];
  if (null != a)
    for (var d in a) "undefined" === typeof this[d] && (this[d] = a[d])
}

function Animation(a) {
  var c = {
      type: "spinOngoing",
      direction: "clockwise",
      propertyName: null,
      propertyValue: null,
      duration: 10,
      yoyo: !1,
      repeat: null,
      easing: null,
      stopAngle: null,
      spins: null,
      clearTheCanvas: null,
      callbackFinished: null,
      callbackBefore: null,
      callbackAfter: null,
      callbackSound: null,
      soundTrigger: "segment"
    },
    b;
  for (b in c) this[b] = null != a && "undefined" !== typeof a[b] ? a[b] : c[b];
  if (null != a)
    for (var d in a) "undefined" === typeof this[d] && (this[d] = a[d])
}

function Segment(a) {
  var c = {
      size: null,
      text: "",
      fillStyle: null,
      strokeStyle: null,
      lineWidth: null,
      textFontFamily: null,
      textFontSize: null,
      textFontWeight: null,
      textOrientation: null,
      textAlignment: null,
      textDirection: null,
      textMargin: null,
      textFillStyle: null,
      textStrokeStyle: null,
      textLineWidth: null,
      image: null,
      imageDirection: null,
      imgData: null
    },
    b;
  for (b in c) this[b] = null != a && "undefined" !== typeof a[b] ? a[b] : c[b];
  if (null != a)
    for (var d in a) "undefined" === typeof this[d] && (this[d] = a[d]);
  this.endAngle = this.startAngle = 0
}
Segment.prototype.changeImage = function(a, c) {
  this.image = a;
  this.imgData = null;
  c && (this.imageDirection = c);
  winhweelAlreadyDrawn = !1;
  this.imgData = new Image;
  this.imgData.onload = winwheelLoadedImage;
  this.imgData.src = this.image
};

function PointerGuide(a) {
  var c = {
      display: !1,
      strokeStyle: "red",
      lineWidth: 3
    },
    b;
  for (b in c) this[b] = null != a && "undefined" !== typeof a[b] ? a[b] : c[b]
}

function winwheelPercentToDegrees(a) {
  var c = 0;
  0 < a && 100 >= a && (c = a / 100 * 360);
  return c
}

function winwheelAnimationLoop() {
  if (winwheelToDrawDuringAnimation) {
    0 != winwheelToDrawDuringAnimation.animation.clearTheCanvas && winwheelToDrawDuringAnimation.ctx.clearRect(0, 0, winwheelToDrawDuringAnimation.canvas.width, winwheelToDrawDuringAnimation.canvas.height);
    var a = winwheelToDrawDuringAnimation.animation.callbackBefore,
      c = winwheelToDrawDuringAnimation.animation.callbackAfter;
    null != a && ("function" === typeof a ? a() : eval(a));
    winwheelToDrawDuringAnimation.draw(!1);
    null != c && ("function" === typeof c ? c() : eval(c));
    winwheelToDrawDuringAnimation.animation.callbackSound && winwheelTriggerSound()
  }
}

function winwheelTriggerSound() {
  0 == winwheelToDrawDuringAnimation.hasOwnProperty("_lastSoundTriggerNumber") && (winwheelToDrawDuringAnimation._lastSoundTriggerNumber = 0);
  var a = winwheelToDrawDuringAnimation.animation.callbackSound;
  var c = "pin" == winwheelToDrawDuringAnimation.animation.soundTrigger ? winwheelToDrawDuringAnimation.getCurrentPinNumber() : winwheelToDrawDuringAnimation.getIndicatedSegmentNumber();
  c != winwheelToDrawDuringAnimation._lastSoundTriggerNumber && ("function" === typeof a ? a() : eval(a), winwheelToDrawDuringAnimation._lastSoundTriggerNumber =
    c)
}
var winwheelToDrawDuringAnimation = null;

function winwheelStopAnimation(a) {
  0 != a && (a = winwheelToDrawDuringAnimation.animation.callbackFinished, null != a && ("function" === typeof a ? a(winwheelToDrawDuringAnimation.getIndicatedSegment()) : eval(a)))
}
var winhweelAlreadyDrawn = !1;

function winwheelLoadedImage() {
  if (0 == winhweelAlreadyDrawn) {
    for (var a = 0, c = 1; c <= winwheelToDrawDuringAnimation.numSegments; c++) null != winwheelToDrawDuringAnimation.segments[c].imgData && winwheelToDrawDuringAnimation.segments[c].imgData.height && a++;
    a == winwheelToDrawDuringAnimation.numSegments && (winhweelAlreadyDrawn = !0, winwheelToDrawDuringAnimation.draw())
  }
}

function winwheelResize() {
  var a = 40;
  "undefined" !== typeof winwheelToDrawDuringAnimation._responsiveMargin && (a = winwheelToDrawDuringAnimation._responsiveMargin);
  var c = window.innerWidth - a,
    b = winwheelToDrawDuringAnimation._responsiveMinWidth;
  a = winwheelToDrawDuringAnimation._responsiveMinHeight;
  c < b ? c = b : c > winwheelToDrawDuringAnimation._originalCanvasWidth && (c = winwheelToDrawDuringAnimation._originalCanvasWidth);
  c /= winwheelToDrawDuringAnimation._originalCanvasWidth;
  winwheelToDrawDuringAnimation.canvas.width =
    winwheelToDrawDuringAnimation._originalCanvasWidth * c;
  winwheelToDrawDuringAnimation._responsiveScaleHeight && (b = winwheelToDrawDuringAnimation._originalCanvasHeight * c, b < a ? b = a : b > winwheelToDrawDuringAnimation._originalCanvasHeight && (b = winwheelToDrawDuringAnimation._originalCanvasHeight), winwheelToDrawDuringAnimation.canvas.height = b);
  winwheelToDrawDuringAnimation.scaleFactor = c;
  winwheelToDrawDuringAnimation.draw()
};