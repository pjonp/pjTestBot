const fs = require('fs'),
  path = require('path'),
  mainCode = require('./prizeWheel.js');

let fieldDataObj = mainCode.FieldDataMaster,
    outputObject = {};
//Inject Segments at end of Master List from the Main code
let breakPoint = 1 //5; //not used (for breaking into groups i.e 1-5, 6-10, 11-15....)
for(let i = 0; i < 10; i++) {
  let segmentNumber = i+1,
      group = Math.floor(i/breakPoint), //not used
      groupText = `Segment ${segmentNumber}`;//`Segments ${group * breakPoint}-${(group+1) * breakPoint}` //not used
      //set common values
      fieldDataObj[`segment${segmentNumber}_wheelText`] = [`Segment ${segmentNumber} Wheel Text`, groupText, 'text', `${segmentNumber < 5 ? groupText : ''}`];
      fieldDataObj[`segment${segmentNumber}_resText`] = [`Segment ${segmentNumber} Chat Text`, groupText, 'text', `${segmentNumber < 5 ? groupText : ''}`];
      fieldDataObj[`segment${segmentNumber}_size`] = [`Segment ${segmentNumber} Size`, groupText, 'slider', 1, 0.25,2,0.25];
      //add "same as segment X options"...
      if(segmentNumber === 3) fieldDataObj[`segment${segmentNumber}_styleMatch`] = ['Style', groupText, 'dropdown', {0: 'Custom', 1: 'Same as segment 1', 2: 'Same as segment 2'}];
      else if(segmentNumber === 4) fieldDataObj[`segment${segmentNumber}_styleMatch`] = ['Style', groupText, 'dropdown', {0: 'Custom', 1: 'Same as segment 1', 2: 'Same as segment 2', 3: 'Same as segment 3'}];
      else if(segmentNumber === 5) fieldDataObj[`segment${segmentNumber}_styleMatch`] = ['Style', groupText, 'dropdown', {0: 'Custom', 1: 'Same as segment 1', 2: 'Same as segment 2', 3: 'Same as segment 3', 4: 'Same as segment 4'}];
      else if(segmentNumber > 5) fieldDataObj[`segment${segmentNumber}_styleMatch`] = ['Style', groupText, 'dropdown', {0: 'Custom', 1: 'Same as segment 1', 2: 'Same as segment 2', 3: 'Same as segment 3', 4: 'Same as segment 4', 5: 'Same as segment 5'}];
      //add style options
      fieldDataObj[`segment${segmentNumber}_bgColor_info`] = ['No color = random', groupText, 'hidden'];
      fieldDataObj[`segment${segmentNumber}_bgColor`] = [`Segment ${segmentNumber} Background Color`, groupText, 'colorpicker', ''];
      fieldDataObj[`segment${segmentNumber}_fontColor_info`] = ['No color = Black/White (best contrast)', groupText, 'hidden'];
      fieldDataObj[`segment${segmentNumber}_fontColor`] = [`Segment ${segmentNumber} Font Color`, groupText, 'colorpicker', ''];
};
//Make field data...
for (const [key] of Object.entries(fieldDataObj)) {
  outputObject[key] = {
    label: fieldDataObj[key][0],
    group: fieldDataObj[key][1],
    type: fieldDataObj[key][2],
    value: fieldDataObj[key][3]
  };

  if(typeof fieldDataObj[key][4] === 'number') outputObject[key]['min'] = fieldDataObj[key][4];
  if(typeof fieldDataObj[key][5] === 'number') outputObject[key]['max'] = fieldDataObj[key][5];
  if(typeof fieldDataObj[key][6] === 'number') outputObject[key]['steps'] = fieldDataObj[key][6];

  if(outputObject[key]['type'] === 'dropdown') {
    if(typeof outputObject[key]['value'] !== 'object') throw new Error(`Setting for ${key} is set to dropdown but does not have an Object as value`);
      outputObject[key]['options'] = outputObject[key]['value']
      outputObject[key]['value'] = Object.keys(outputObject[key]['value'])[0];
  };
};

fs.writeFileSync(path.resolve(__dirname, './fieldDataMaster.json'),  JSON.stringify(outputObject), 'UTF-8')
console.log(outputObject, ' done')
