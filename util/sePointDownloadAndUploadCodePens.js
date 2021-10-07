//DOWNLOAD
/*HTML
<br>
<h style='font-weight: bold; font-size: 30px; color: navy'>StreamElements Point Object Getter Tool</h>
<p>This form will get your user point Object from StreamElements.</p>
<hr>
<div id='inputs'>
<form action="/action_page.php">
  <label>SE Account ID:</label><br>
  <input type='text' id='inputId' size='25'><br>
  <br>
  <label>SE JWT:</label>
  <br>
  <input type='text' id='inputToken' size='50'>
  <br>
  <br>
  <hr>
  <br>
  <button id='doTheThing' style='background-color: darkorchid; padding: 15px'>Do Thing 🚀</button>
  </form>
  <br>
</div>
<div id='logs' style='color: crimson; font-weight: bold'></div>
<br>
<textarea id="outputInfo" rows="100" cols="100">
</textarea>
*/
/*CSS
* {
  color: ivory;
  background-color: gray;
  font-size: 16px;
}
*/
let inputId, inputToken, paginationSize = 1000, paginationProgress = 0, totalUsers = 0, outputObject = {};

//**SET UP
document.getElementById('doTheThing').addEventListener('click', e => {
  e.preventDefault();
  inputId = document.getElementById("inputId").value;
  inputToken = document.getElementById("inputToken").value;
  if(inputId.length !== 24) return basicErrorCheck('Error: inputId ID is not 24 characters.');
  if(inputToken.length < 300) return basicErrorCheck('Error: JWT Token is too short.');

  document.getElementById("doTheThing").remove();
  document.getElementById("logs").innerText = 'Running....'

  loadData().then(d => readData(d)).catch(e => console.log(e.toString()));
});

function basicErrorCheck(e){
  console.log(e);
  document.getElementById("logs").innerText = e;
};

function loadData() {
  return new Promise((resolve, reject) => {

    fetch(`https://api.streamelements.com/kappa/v2/points/${inputId}/top?limit=${paginationSize}&offset=${paginationProgress}`, {
        "method": "GET",
        "headers": {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${inputToken}`
        },
      })
      .then(response => response.json())
      .then(json => {
        resolve(json);
      })
      .catch(reject);
  });
};

function readData(pointData) {
  if(!totalUsers) {
    totalUsers = pointData['_total'];
    outputObject = pointData;
  } else {
    outputObject.users.push(...pointData.users);
  };

  paginationProgress += paginationSize;

  if(paginationProgress >= totalUsers) {
      document.getElementById("logs").innerText = `DONE`;
      postData();
  } else {
     document.getElementById("logs").innerText = `Getting ${paginationProgress} of ${totalUsers}...`;
    setTimeout(_ => loadData().then(d => readData(d)).catch(e => e.toString()), 2000); //Limit API calls to every 2 seconds.
  };
};

function postData () {
  document.getElementById("logs").innerText = 'Save this data somewhere safe:'
  document.getElementById("outputInfo").innerText = JSON.stringify(outputObject);
};

//*****************

//*****************

//*****************

//UPLOAD
/*HTML
<br>
<h style='font-weight: bold; font-size: 30px; color: navy'>StreamElements Point PUT Tool</h>
<p>This form will run a script that uploads the point Object got from the downloader to an account on StreamElements.</p>
<hr>
<div id='inputs'>
<form action="/action_page.php">
  <label>SE Account ID:</label><br>
  <input type='text' id='outputId' size='25'><br>
  <br>
  <label>SE JWT:</label>
  <br>
  <input type='text' id='outputToken' size='50'>
  <br>
  <br>
  <hr>
  <textarea id="outputObject" rows="10" cols="100">PASTE DATA HERE</textarea>
  <hr>
  <br>
  <button id='doTheThing' style='background-color: darkorchid; padding: 15px'>Do Thing 🚀</button>
  </form>
  <br>
</div>
<div id='logs' style='color: crimson; font-weight: bold'></div>
*/
/*CSS
* {
  color: ivory;
  background-color: gray;
  font-size: 16px;
}
*/
let outputId, outputToken, outputObject, warningCount = 0, warningTimer, userCount = 0;
//set up button
document.getElementById('doTheThing').addEventListener('click', e => {
  e.preventDefault();
  if(warningCount < 1) {
    warningCount++;
    document.getElementById("doTheThing").innerText = 'Are You Sure?';
    warningTimer = setTimeout(_=> {
      warningCount = 0;
      document.getElementById("doTheThing").innerText = 'Do Thing 🚀';
    }, 2000);
    return;
  };

  clearTimeout(warningTimer);
  warningCount = 0;
  outputId = document.getElementById("outputId").value;
  outputToken = document.getElementById("outputToken").value;
  outputObject = document.getElementById("outputObject").value;
  if(outputId.length !== 24) return basicErrorCheck('Error: Output ID is not 24 characters.');
  if(outputToken.length < 300) return basicErrorCheck('Error: JWT Token is too short.');
  try{
    outputObject = JSON.parse(document.getElementById("outputObject").value);
    //edit here to remove length check on Object
    if(outputObject['_total'] === outputObject.users.length) {
      document.getElementById("doTheThing").remove();
      document.getElementById("logs").innerText = 'Uploading...'
      readData();
    } else {
      return basicErrorCheck(`Something is off with your SE Object, the Total amount should equal the users`);
    };
  } catch (e) {
    return basicErrorCheck(`Error: ${e}`);
  };
});

function basicErrorCheck(e){
  console.log(e);
  document.getElementById("logs").innerText = e;
};

function readData() {
  let SEUserObject = outputObject.users.map(i => {
      return {
        "username": i.username,
        "current": i.points
      }
    }),
    SEDataObject = {
      "mode": "set", //"add"
      "users": SEUserObject
    };

  userCount = SEUserObject.length;

  uploadData(SEDataObject).then(d => {
    basicErrorCheck(`Done! Points added to ${userCount} users.`);
  }).catch(e => {
    basicErrorCheck(`!!! Something went wrong: `, e.toString());
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
