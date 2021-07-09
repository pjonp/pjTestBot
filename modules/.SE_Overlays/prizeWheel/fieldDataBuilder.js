const fs = require('fs'),
  path = require('path'),
  animateCSSAnimations = require('./AnimateCSSAnimations.json');

let inAnimations = {}, outAnimations = {};
//filter animations for IN or OUT
Object.entries(animateCSSAnimations).forEach( i => {
  if(i[0].includes('In')) inAnimations[i[0]] = i[0];
  if(i[0].includes('Out')) outAnimations[i[0]] = i[0];
});
  //Master Field Data Object:
  //FieldDataMaster[KEY][LABEL, GROUP, TYPE, [ VALUE, MIN, MAX, STEP, FUNCTION ] ]
let FieldDataMaster = {
    testButton: ['Test Spin', 'Testing', 'button'],
    _info1: ['Middleware provided by lx', 'Middleware Setup', 'hidden'],
    sayToChat: ['Announce result to chat', 'Middleware Setup', 'dropdown', {no: 'No', yes:'Yes'}, i => i === 'yes'],
    _info2: ['https://jebaited.net/tokens/ ->', 'Middleware Setup', 'hidden'],
    jebaitedAPIToken: ['Token', 'Middleware Setup', 'text', 'token'],
    _info3: ['variables: {res} | {user}', 'Middleware Setup', 'hidden'],
    chatResponse: ['Chat Response', 'Middleware Setup', 'text', '{res}'],
    chatResponseDelay: ['Chat Response (stream) Delay (s)', 'Middleware Setup', 'slider', 5, 1, 10, 1],
    showWheelOnLoad: ['Show Wheel On Load', 'Main Settings', 'dropdown', {yes: 'Yes', no: 'No'}, i => i === 'yes'],
    spinCommand: ['Spin Command', 'Main Settings', 'text', '!spin'],
    wheelShowCommand: ['Show Wheel Command', 'Main Settings', 'text', '!showwheel'],
    wheelHideCommand: ['Hide Wheel Command', 'Main Settings', 'text', '!hidewheel'],
    duration: ['Duration (s)', 'Main Settings', 'slider', 10, 5, 30, 1],
    spins: ['Spin speed', 'Main Settings', 'slider', 10, 3, 50, 1],
    gameOverDelay: ['Spin End Screen (s)', 'Main Settings', 'slider', 5, 1, 30, 1],
    playTickSound: ['Play Tick Sound', 'Main Settings', 'dropdown', {yes: 'Yes', no: 'No'}, i => i === 'yes'],
    backgroundSound: ['Background Sound', 'Main Settings', 'sound-input', '', i => new Audio(i)],
    backgroundSoundVolume: ['Background Sound Volume', 'Main Settings', 'slider', 0.5, 0.1, 1, 0.1],
    fontFamily: ['Font', 'Visual Settings', 'googleFont', 'Open Sans'],
    fontSize: ['Font Size', 'Visual Settings', 'number', 20, 5, 100],
    usernameColor: ['Username Color', 'Visual Settings', 'colorpicker', 'white'],
    usernameFontSize: ['Username Font Size', 'Visual Settings', 'number', 50, 5, 300],
    usernameOffset: ['Username Y Position', 'Visual Settings', 'number', 600],
    animationIn: ['Animation In', 'Visual Settings', 'dropdown', inAnimations],
    animationOut: ['Animation Out', 'Visual Settings', 'dropdown', outAnimations],
    foregroundVideo: ['Video Overlay', 'Visual Settings', 'video-input', 'https://raw.githubusercontent.com/pjonp/pjTestBot/master/modules/.SE_Overlays/chatterWheel/assets/JayniusGamingTV_demo.webm'],
    foregroundImage: ['Image Overlay', 'Visual Settings', 'image-input', 'https://raw.githubusercontent.com/pjonp/pjTestBot/master/modules/.SE_Overlays/chatterWheel/assets/streamElementsLogo.gif'],
    _info4: ['Animated gradient webcam frame', 'Animated Gradient Frame', 'hidden'],
    _info5: ['by Kagrayz', 'Animated Gradient Frame', 'hidden'],
    mask: ['Mask Image', 'Animated Gradient Frame', 'dropdown', {none: 'none',
          'https://raw.githubusercontent.com/pjonp/pjTestBot/master/modules/.SE_Overlays/chatterWheel/assets/demo1.png': 'Solid Border',
          'https://raw.githubusercontent.com/pjonp/pjTestBot/master/modules/.SE_Overlays/chatterWheel/assets/demo2.png': 'Faded Border',
          'https://raw.githubusercontent.com/pjonp/pjTestBot/master/modules/.SE_Overlays/chatterWheel/assets/demo3.png': 'Faded Border With Center Plug'}],
    firstColor: ['First Color', 'Animated Gradient Frame', 'colorpicker', '#00abff'],
    secondColor: ['Second Color', 'Animated Gradient Frame', 'colorpicker', '#6701a5'],
    frameDuration: ['Rotating duration (s)', 'Animated Gradient Frame', 'number', 2.5],
    cacheMask: ['Second Color', 'Animated Gradient Frame', 'checkbox'],
    gradientOverride: ['', 'Animated Gradient Frame', 'hidden', 40],
    wheelSize: ['Wheel Size (Ø)', 'Advanced Settings', 'number', 900],
    innerRadius: ['Inner Radius (%)', 'Advanced Settings', 'slider', 5, 0, 90, 1],
    textAlignment: ['Text Alignment', 'Advanced Settings', 'dropdown', {outer: 'Outer', inner: 'Inner', center: 'Center'}],
    textOrientation: ['Text Orientation', 'Advanced Settings', 'dropdown', {horizontal: 'Horizontal', vertical: 'Vertical', curved: 'Curved'}],
    textDirection: ['Text Direction', 'Advanced Settings', 'dropdown', {normal: 'Normal', reversed: 'Reversed'}],
    textMargin: ['Wheel Text Margin', 'Advanced Settings', 'number', 20],
    wheelStartingPositionX: ['Wheel Start X Position', 'Advanced Settings', 'number', 50],
    wheelStartingPositionY: ['Wheel Start Y Position', 'Advanced Settings', 'number', 50],
    foregroundVideoSize: ['Video Overlay Size (%)', 'Advanced Settings', 'number', 110],
    foregroundImageSize: ['Image Overlay Size (%)', 'Advanced Settings', 'number', 25],
    foregroundImageRadius: ['Image Overlay Radius (%)', 'Advanced Settings', 'slider', 50,0,50,1],
    wheelName: ['Wheel Label', 'Advanced Settings', 'text', ''],
    wheelNameColor: ['Wheel Label Color', 'Advanced Settings', 'colorpicker', 'white'],
    wheelNameFontSize: ['Wheel Label Size', 'Advanced Settings', 'number', 100, 5, 300],
    wheelNameOffset: ['Wheel Label Position', 'Advanced Settings', 'number', 800],
    movingWheelSpeed: ['Moving Wheel Speed', 'Advanced Settings', 'slider', 0,0,100,1],
  },
  outputObject = {};
//Inject Segments at end of Master List from the Main code
let breakPoint = 1 //5; //not used (for breaking into groups i.e 1-5, 6-10, 11-15....)
for(let i = 0; i < 25; i++) {
  let segmentNumber = i+1,
      group = Math.floor(i/breakPoint), //not used
      groupText = `Segment ${segmentNumber}`;//`Segments ${group * breakPoint}-${(group+1) * breakPoint}` //not used "Segments 1-5" ... "Segments 6-10" ....
      //set common values
      FieldDataMaster[`segment${segmentNumber}_wheelText`] = [`Segment ${segmentNumber} Wheel Text`, groupText, 'text', `${segmentNumber < 5 ? groupText : ''}`];
      FieldDataMaster[`segment${segmentNumber}_resText`] = [`Segment ${segmentNumber} Chat Text`, groupText, 'text', `${segmentNumber < 5 ? groupText : ''}`];
      FieldDataMaster[`segment${segmentNumber}_size`] = [`Segment ${segmentNumber} Size`, groupText, 'slider', 1, 0.25,2,0.25];
      //add "same as segment X options"...
      if(segmentNumber === 3) FieldDataMaster[`segment${segmentNumber}_styleMatch`] = ['Style', groupText, 'dropdown', {0: 'Custom', 1: 'Same as first', 2: 'Same as second'}];
      else if(segmentNumber === 4) FieldDataMaster[`segment${segmentNumber}_styleMatch`] = ['Style', groupText, 'dropdown', {0: 'Custom', 1: 'Same as first', 2: 'Same as second', 3: 'Same as third'}];
      else if(segmentNumber === 5) FieldDataMaster[`segment${segmentNumber}_styleMatch`] = ['Style', groupText, 'dropdown', {0: 'Custom', 1: 'Same as first', 2: 'Same as second', 3: 'Same as third', 4: 'Same as fourth'}];
      else if(segmentNumber > 5) FieldDataMaster[`segment${segmentNumber}_styleMatch`] = ['Style', groupText, 'dropdown', {0: 'Custom', 1: 'Same as first', 2: 'Same as second', 3: 'Same as third', 4: 'Same as fourth', 5: 'Same as fifth'}];
      //add style options
      FieldDataMaster[`segment${segmentNumber}_bgColor_info`] = ['No color = random', groupText, 'hidden'];
      FieldDataMaster[`segment${segmentNumber}_bgColor`] = [`Segment ${segmentNumber} Background Color`, groupText, 'colorpicker', ''];
      FieldDataMaster[`segment${segmentNumber}_fontColor_info`] = ['No color = Black/White (best contrast)', groupText, 'hidden'];
      FieldDataMaster[`segment${segmentNumber}_fontColor`] = [`Segment ${segmentNumber} Font Color`, groupText, 'colorpicker', ''];
      FieldDataMaster[`segment${segmentNumber}_addPoints`] = ['Add Points To Targeted User?', groupText, 'dropdown', {no: 'No', yes:'Yes'}, i => i === 'yes'];
      FieldDataMaster[`segment${segmentNumber}_points`] = ['Points', groupText, 'number'];
      FieldDataMaster[`segment${segmentNumber}_bgImage`] = ['Section Image (Advanced)', groupText, 'image-input', ''];
};
//Make field data...
for (const [key] of Object.entries(FieldDataMaster)) {
  outputObject[key] = {
    label: FieldDataMaster[key][0],
    group: FieldDataMaster[key][1],
    type: FieldDataMaster[key][2],
    value: FieldDataMaster[key][3]
  };

  if(typeof FieldDataMaster[key][4] === 'number') outputObject[key]['min'] = FieldDataMaster[key][4];
  if(typeof FieldDataMaster[key][5] === 'number') outputObject[key]['max'] = FieldDataMaster[key][5];
  if(typeof FieldDataMaster[key][6] === 'number') outputObject[key]['steps'] = FieldDataMaster[key][6];

  if(outputObject[key]['type'] === 'dropdown') {
    if(typeof outputObject[key]['value'] !== 'object') throw new Error(`Setting for ${key} is set to dropdown but does not have an Object as value`);
      outputObject[key]['options'] = outputObject[key]['value']
      outputObject[key]['value'] = Object.keys(outputObject[key]['value'])[0];
  };
};

fs.writeFileSync(path.resolve(__dirname, './fieldDataMaster.json'),  JSON.stringify(outputObject), 'UTF-8')
console.log(outputObject, ' done')
