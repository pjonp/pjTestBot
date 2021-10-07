// EXAMPLE: https://codepen.io/pjonp/pen/eYRLQZX
/* HTML
<br>
<h style='font-weight: bold; font-size: 30px; color: navy'>StreamElements Sheet Tool</h>
<p>This form will run a script that ... from the input account to the output account on StreamElements.</p>
<hr>
<div id='inputs'>
<form action="/action_page.php">
  <label>Google Sheet ID to get info FROM:</label><br>
  <input type='text' id='inputId' size='25' value ='SHEET ID'><br>
  <br>
  <label>Google Sheet NAME to get info FROM:</label><br>
  <input type='text' id='inputName' size='25' value='Sheet1'><br>
  <br>
  <label>Google Sheet API KEY to get info FROM:</label><br>
  <input type='text' id='inputToken' size='25' value='KEY HERE'><br>
  <br>
  <hr>
  <br>
  <label>SE Account ID:</label><br>
  <input type='text' id='outputId' size='25'><br>
  <br>
  <label>SE JWT:</label>
  <br>
  <input type='text' id='outputJWT' size='50'>
  <br>
  <br>
  <hr>
  <br>
  <button id='doTheThing' style='background-color: darkorchid; padding: 15px'>Do Thing 🚀</button>
  </form>
  <br>
</div>
<div id='logs' style='color: crimson; font-weight: bold'></div>
*/
/* CSS
* {
  color: ivory;
  background-color: gray;
  font-size: 16px;
}
*/

let inputId, inputName, inputToken, outputId, outputToken, warningCount = 0,
  warningTimer, userCount = 0;

//**SET UP
document.getElementById('doTheThing').addEventListener('click', e => {
  e.preventDefault();
  if (warningCount < 1) {
    warningCount++;
    document.getElementById("doTheThing").innerText = 'Are You Sure?';
    warningTimer = setTimeout(_ => {
      warningCount = 0;
      document.getElementById("doTheThing").innerText = 'Do Thing 🚀';
    }, 2000);
    return;
  };
  clearTimeout(warningTimer);
  warningCount = 0;
  inputId = document.getElementById("inputId").value;
  inputName = document.getElementById("inputName").value;
  inputToken = document.getElementById("inputToken").value;
  outputId = document.getElementById("outputId").value;
  outputToken = document.getElementById("outputJWT").value;
  if (inputId.length !== 44) return basicErrorCheck('Error: Sheet ID is not 44 characters.');
  if (inputToken < 35) return basicErrorCheck('Error: Input TOKEN not long enough.');
  if (outputId.length !== 24) return basicErrorCheck('Error: Output ID is not 24 characters.');
  if (outputId === inputId) return basicErrorCheck('Error: Input ID is the same as Output ID 🤔');
  if (outputToken.length < 300) return basicErrorCheck('Error: JWT Token is too short.');

  document.getElementById("doTheThing").remove();
  document.getElementById("logs").innerText = 'Running. Check the console for information!'

  loadData().then(d => readData(d)).catch(e => console.log(e.toString()));
});

function basicErrorCheck(e) {
  console.log(e);
  document.getElementById("logs").innerText = e;
};



function loadData() {
  const targetCells = "A:B",
    dataSource = `https://sheets.googleapis.com/v4/spreadsheets/${inputId}/values/${inputName}!${targetCells}?key=${inputToken}`;
  return new Promise((resolve, reject) => {

    fetch(dataSource)
      .then(response => response.json())
      .then(json => {
        if (json.error) throw new Error(JSON.stringify(json));
        else if (json.values.length <= 1) throw new Error('Sheet is less than 2 rows long'); //make sure that data exists
        //  json.values.shift(); //remove headers
        let data = json.values.filter(i => i[0] && i[1]); //make sure there is both a question && answer (don't add if 1 is missing)
        if (data.length < 1) throw new Error('No data');
        resolve(data);
      })
      .catch(reject);
  });



};

function readData(pointData) {
  let SEUserObject = pointData.map(i => {
      return {
        "username": i[0],
        "current": i[1]
      }
    }),
    SEDataObject = {
      "mode": "set", //use "add" to add points
      "users": SEUserObject
    };

  userCount = SEUserObject.length;

  uploadData(SEDataObject).then(d => {
    console.log(`DONE!`);
    basicErrorCheck(`Done! Points added to ${userCount} users.`);
    //  setTimeout(() => readData(data), 1000);
  }).catch(e => {
    basicErrorCheck(`!!! Something went wrong: `, e.toString());
    //  setTimeout(() => readData(cmdId), 1000);
  });
};

function uploadData(sePointObject) {
  return new Promise((resolve, reject) => {
    fetch(`https://api.streamelements.com/kappa/v2/points/${outputId}`, {
        "method": "PUT",
        "headers": {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${outputToken}`
        },
        "body": JSON.stringify(sePointObject)
      })
      .then(response => response.text())
      .then(text => {
        console.log('text: ', text);
        if (text !== 'Created') throw new Error(text);
        else resolve(text);
      })
      .catch(reject);
  });
};
