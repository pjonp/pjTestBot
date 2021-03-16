/*
RotatorS AKA Rotator-a-Saurus AKA Roar-A-Tator-Saurus AKA Goals-R-Saur-Us AKA Ruben's Rotating Thingy AKA

AiO RotatoGoal 1.0.0 by pjonp

inspired by RubenSaurus
with help from JayniusGamingTV

The MIT License (MIT)
Copyright (c) 2021 pjonp
*/
const currencySetting = ['{{FD_currencyLocale}}', 'Set_OnWidgetLoad', {{FD_currencyDecimals}}]; //example: ['en-US', 'USD', decimals] / ['de-DE', 'EUR', 2] / ['ja-JP', 'JPY', 2]

/*
['LOCALE', 'CURRECNYCODE', 'DECIMALS TO SHOW']
locale is made up of:
language: https://www.w3schools.com/tags/ref_language_codes.asp
-
Country: https://www.w3schools.com/tags/ref_country_codes.asp
i.e LOCALE: 'en-CA' for English Canada CURRECNY: 'CAD' for Canadian Dollar
- Decimals: 0 -> $10 ; 2 -> $10.50
*/
let allGoals = {}, //set empty goal object. KEYs: goal names; VALUES: progress, goal, label, currency (true/false)
  goalList = [], //KEYs for above allGoals Object to rotate through
  maxFontSize = 100,
  vertBar = false;

//move to FIELDS
let time = 10; //seconds

//Grab HTML DOM nodes for moving stuff around
const card = document.getElementById('card'),
  hiddenContainer = document.getElementById('hiddenBars'),
  sides = ['front', 'back'];

//main animation function; Animation is handled by CSS animation classes.
//this code takes the information on the "back side" and moves it into the hidden area.
//then grabs the next goal and puts it on the backsid e, then trigger the flip animation
//so everything is hidden on the back of the card out of view

//goalIndex[0] & [1] are prebuilt by buildBarHTML();
function flip(goalIndex = 2, side = 1) {
//if there is only 1 or 2 sides; there is no need to move things around... just flip.
  if (goalList.length > 2) {

    let hiddenSide = document.getElementById(`${sides[side]}`),
      newGoal = document.getElementById(`${goalList[goalIndex]}`);

    hiddenContainer.appendChild(hiddenSide.firstChild); //move back side content to hidden contatiner
    hiddenSide.appendChild(newGoal); //move new goal onto backside

    goalIndex++;
    goalIndex = goalIndex >= goalList.length ? 0 : goalIndex;
    side++;
    side = side >= sides.length ? 0 : side;
  };

  card.classList.toggle("rot-x-1");
  card.classList.toggle("rot-x-2");
  //card.classList.toggle("rot-y-1");
  //card.classList.toggle("rot-y-2");

  setTimeout(() => flip(goalIndex, side), time * 1000);
};

function visualError(e) {
  console.log('Error: ', e);
  sides.forEach(i => document.getElementById(i).innerText = e);
}

window.addEventListener('onWidgetLoad', obj => {
  let data = obj.detail.session.data,
    fieldData = obj.detail.fieldData;

    currencySetting[1] = obj.detail.currency.code || 'USD'; //set currency code
    time = fieldData[`FD_showTime`] || 30;
    maxFontSize = fieldData[`FD_maxFontSize`] || 100;
    vertBar = fieldData[`FD_vertBar`] === 'yes';

  Object.keys(data).forEach(i => { //get Goals based on session (only load platform goals, Twitch/fB/yT)
    if (i.includes('goal') && fieldData[`FD_${i}_enabled`] === 'yes') { //filter info for 'goal' & check if enabled

      const getIcon = selected => {
        if(selected === 'none') return ''
        else if(selected === 'other') return fieldData[`FD_${i}_iconOther`] || ''
        else return selected
      }

      allGoals[i] = { //build goal object with key name of goal i.e. 'tip-goal'
        progress: data[i].amount, //progress on load
        target: fieldData[`FD_${i}_target`] || 1000, //default 1000; get target goal amount from field data (use common FD names 'FD_tip-goal_target')
        label: fieldData[`FD_${i}_label`] || '', //default empty
        icon: getIcon(fieldData[`FD_${i}_icon`]),
        currency: i.includes('tip'),
        barColor1: fieldData[`FD_${i}_barColor1`],
        barColor2: fieldData[`FD_${i}_barColor2`],
      };
      goalList.push(i);
    };
  });
  if (goalList.length === 0) return visualError('NO GOALS SET'); //end if no goals to build.
  console.log('allGoals', allGoals);
  //build HTML for each
  buildBarHTML();
});

//when something
window.addEventListener('onSessionUpdate', obj => {
  if (goalList.length === 0) return; //end if no goals to check. to-do: visual error
  let data = obj.detail.session;
  Object.keys(data).forEach(i => { //check session data for the change
    if (i.includes('goal') && allGoals.hasOwnProperty(i)) { //filter info for 'goal' & see if it is in master object (enabled)
      if (allGoals[i].progress === data[i].amount) return; //stop if not changed
      console.log("PROGRESS AMOUNT: ", data[i].amount);
      allGoals[i].progress = data[i].amount; //update local Object value
      let barTarget = document.getElementById(`${i}_bar`);
      barTarget.style.width = `${(allGoals[i].progress/allGoals[i].target)*100}%`;
      setTimeout( () => {
        document.getElementById(`${i}_amount`).querySelector('.textFitted').innerText = allGoals[i].currency ? formatCurrency(allGoals[i].progress) : allGoals[i].progress;
      },1000)
    };
  });
});

//format into currency if needed (called from bulidingHTML or updating a value)
const formatCurrency = num => new Intl.NumberFormat(currencySetting[0], {
  style: 'currency',
  currency: currencySetting[1],
  minimumFractionDigits: currencySetting[2],
  maximumFractionDigits: currencySetting[2]
}).format(num);

//build the HTML (called onLoad to build ALL the bars)
function buildBarHTML() {
//where to hide the bars (if not on front or back... hide it)
  let hiddenContainer = document.getElementById('hiddenBars'),
     fontOptions = {minFontSize:10, maxFontSize: maxFontSize};
//create each bar HTML based on the options. Only create the bars needed
  Object.keys(allGoals).forEach((goal, index) => {
//make a new DOM node
    const goalContainer = document.createElement('div');
//copy-pasta HTML code for each bar
    let barStyle = `
    width: ${(allGoals[goal].progress/allGoals[goal].target)*100}%;
    background: linear-gradient(90deg, ${allGoals[goal].barColor1}, ${allGoals[goal].barColor2});
    background-size: 400% 400%;
    animation: barBgShift var(--glowTime) ease-out infinite;
    `,
    barHTML = `
      <div id='${goal}_bar' class='bar' style='${barStyle}'></div>
      <div id='${goal}_amount' class='content contentLeft'></div>
      <div id='${goal}_icon' class='content contentCenter'></div>
      <div id='${goal}_target' class='content contentRight'></div>
      <div id='${goal}_text' class='content goalText'></div>
`;
//set basic HTML/CSS values, id & class
    goalContainer.setAttribute('id', `${goal}`);
    goalContainer.classList.add('goalContainer');
    goalContainer.innerHTML = barHTML;
//add to DOM
    document.getElementById(`main`).appendChild(goalContainer);
//get target locations
    let a = document.getElementById(`${goal}_amount`),
      b = document.getElementById(`${goal}_icon`),
      c = document.getElementById(`${goal}_target`),
      d = document.getElementById(`${goal}_text`),
      //check if value should be a currency type
      goalAmountString = `${allGoals[goal].currency ? formatCurrency(allGoals[goal].target) : allGoals[goal].target}`;
//set values from settings/progress
    a.innerText = goalAmountString; //set the amount to max goal to match size;
    //check if icon input is valid fontAweome or switch to text
    if(allGoals[goal].icon.includes('fa-')) b.innerHTML = `<i class="${allGoals[goal].icon.replace(/<i class=\"/g, '').replace(/\">/g, '').replace(/<\/i>/g, '')}"></i>`
    else b.innerText = allGoals[goal].icon;
    c.innerText = goalAmountString;
    d.innerText = allGoals[goal].label;
//rotate stuff?
if(vertBar) {
  const main = document.getElementById('main')
  a.classList.add('rot90');
  b.classList.add('rot90');
  c.classList.add('rot90');
  main.classList.add('rot270');
};
//
//fit values using textFit CDN (imported in HTML)
    textFit(a, fontOptions);
    textFit(b, fontOptions);
    textFit(c, fontOptions);
    textFit(d, fontOptions);
//update goal progress after sizing to max
    a.querySelector('.textFitted').innerText = `${allGoals[goal].currency ? formatCurrency(allGoals[goal].progress) : allGoals[goal].progress}`;
//move into position; front of card, back or in holding area
    if (index == 0) document.getElementById(`${sides[0]}`).appendChild(goalContainer);
    else if (index == 1 && goalList.length === 2) document.getElementById(`${sides[1]}`).appendChild(goalContainer);
    else hiddenContainer.appendChild(goalContainer);
  });
//start the rotating
  flip();
};
