const fs = require('fs'),
  path = require('path');
  //Master Field Data Object:
  //FieldDataMaster[KEY][LABEL, GROUP, TYPE, [ VALUE, MIN, MAX, STEP, FUNCTION ] ]
let FieldDataMaster = {
    _info1: ['Twitch Channel Points Example', 'Main', 'hidden'],
    emojiSize: ['Emoji Size (255px Max)', 'Main', 'slider', 255, 5,255,1],

    _info2: ['Middleware provided by lx', 'Middleware Setup', 'hidden'],
    _info3: ['https://jebaited.net/tokens/ ->', 'Middleware Setup', 'hidden'],
    jebaitedAPIToken: ['Token: botMsg', 'Middleware Setup', 'text', 'token'],
  },
  outputObject = {};

let exN = ['Hearts',
    'Clock',
    'No Evil',
    'Boom'
  ]
let exE = ['🧡💛💚💙💜🤎🖤🤍',
  '🕛 Twelve O’Clock 🕧 Twelve-Thirty 🕐 One O’Clock 🕜 One-Thirty 🕑 Two O’Clock 🕝 Two-Thirty 🕒 Three O’Clock 🕞 Three-Thirty 🕓 Four O’Clock 🕟 Four-Thirty 🕔 Five O’Clock 🕠 Five-Thirty 🕕 Six O’Clock 🕡 Six-Thirty 🕖 Seven O’Clock 🕢 Seven-Thirty 🕗 Eight O’Clock 🕣 Eight-Thirty 🕘 Nine O’Clock 🕤 Nine-Thirty 🕙 Ten O’Clock 🕥 Ten-Thirty 🕚 Eleven O’Clock 🕦 Eleven-Thirty',
  '🙈🙉🙊🙈🙉🙊🙈🙉🙊',
  '💣💣💣💣💥'
]


//Inject Rewards at end of Master List from the Main code
for(let i = 0; i < 5; i++) {
  let rewardId = i+1,
      group = i, //not used
//FieldDataMaster[KEY][LABEL, GROUP, TYPE, [ VALUE, MIN, MAX, STEP, FUNCTION ] ]
      groupText = `Reward #${rewardId}`;//set common values

      FieldDataMaster[`reward${rewardId}_testButton`] = [`Reward ${rewardId} Test Button`, groupText, 'button'];
      FieldDataMaster[`reward${rewardId}_showOnLoad`] = [`Reward ${rewardId} Show On Load/Change (Editor Only)`, groupText, 'checkbox', true];
      FieldDataMaster[`reward${rewardId}_rewardText`] = [`Reward ${rewardId} Text Name: (EXACT)`, groupText, 'text', exN[i] || ''];
      FieldDataMaster[`reward${rewardId}_duration`] = [`Reward ${rewardId} Duration (s)`, groupText, 'number', 5, 0.5, 3600];
      FieldDataMaster[`reward${rewardId}_emojis`] = [`Emojis To Rotate (any separator)`, groupText, 'text', exE[i] || ''];
      FieldDataMaster[`reward${rewardId}_speed`] = [`Emoji Switch Speed (s) [0 = auto]`, groupText, 'number', 0, 0, 3600];
      FieldDataMaster[`reward${rewardId}_audio`] = [`Reward ${rewardId} Audio`, groupText, 'sound-input'];
      FieldDataMaster[`reward${rewardId}_audioVolume`] = [`Reward ${rewardId} Audio Volume`, groupText, 'slider', 100, 10, 100, 1];
      FieldDataMaster[`reward${rewardId}_audioDelay`] = [`Reward ${rewardId} Audio Delay (s)`, groupText, 'number', 0, 0, 3600];

      FieldDataMaster[`reward${rewardId}_info1`] = ['Chat Message: {reward} | {user}', groupText, 'hidden'];
      FieldDataMaster[`reward${rewardId}_chatMsg`] = [`Requires Jebaited Token`, groupText, 'text'];
      FieldDataMaster[`reward${rewardId}_chatMsgDelay`] = [`Chat Delay (sync w/ stream delay)`, groupText, 'slider', 0, 0, 10, 0.5];
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
