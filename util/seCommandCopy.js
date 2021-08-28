
//SEE https://codepen.io/pjonp/pen/powzLdP for LIVE VERSION

/*
** ONLY PUBLIC COMMANDS WILL BE COPIED ! **
https://streamelements.com/xxx/commands for your public commands
** ^^^ **
*/
//account to GET information from:
let inputId = 'inputID';
//***********

//account to SEND information to:
let outputId = 'targetID',
  outputToken = 'JWT TOKEN';
//***********

const fetch = require('node-fetch');
let commands = [],
  adds = [],
  fails = [];

function loadCommands() {
  return new Promise((resolve, reject) => {
    fetch(`https://api.streamelements.com/kappa/v2/bot/commands/${inputId}`)
      .then(response => response.json())
      .then(json => {
        if (json.error) throw new Error(JSON.stringify(json)); //?? errors unknown
        commands = json;
        console.log(`${commands.length} Loaded.`);
        resolve(json);
      })
      .catch(reject);
  });
};

function readCommands(cmdId) {
  cmdId++;
  if (cmdId === commands.length) {
    console.log(`****** Done!`);
    console.log(`${cmdId} Commands Were Found`);
    console.log(`${adds.length} Commands Were Added: `, adds);
    console.log(`*****`);
    console.log(`${fails.length} Commands Failed!!!!: `, fails);
    console.log(`*****`);
    return;
  };
  uploadCommand(commands[cmdId]).then(d => {
    adds.push(commands[cmdId].command);
    console.log(`${commands[cmdId].command} ADDED!`);
    setTimeout(() => readCommands(cmdId), 1000);
  }).catch(e => {
    fails.push(commands[cmdId].command);
    console.log(`ERROR!!! Couldn't add command: ${commands[cmdId].command} ; Error: `, e)
    setTimeout(() => readCommands(cmdId), 1000);
  });
};

function uploadCommand(command) {
  return new Promise((resolve, reject) => {
    fetch(`https://api.streamelements.com/kappa/v2/bot/commands/${outputId}`, {
        "method": "POST",
        "headers": {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${outputToken}`
        },
        "body": JSON.stringify(command)
      })
      .then(response => response.json())
      .then(json => {
        if (json.error) throw new Error(JSON.stringify(json)); //?? errors unknown
        resolve(json);
      })
      .catch(reject);
  });
};

loadCommands().then(d => readCommands(-1)).catch(e => console.log(e));
