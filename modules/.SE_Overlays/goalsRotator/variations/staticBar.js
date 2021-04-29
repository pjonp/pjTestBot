console.log('load')
/*
  ~~RotatorS AKA Rotator-a-Saurus AKA Roar-A-Tator-Saurus AKA Goals-R-Saur-Us AKA Ruben's Rotating Thingy AKA~~

  ~~AiO RotatoGoal 2.0.0 by pjonp~~ Loading Bar Edit. This widget is NOT officially supported!

  The MIT License (MIT)
  Copyright (c) 2021 pjonp
  */
  let allGoals = {}, //set empty goal object. KEYs: goal names; VALUES: progress, goal, label, currency (true/false)
    goalList = [], //KEYs for above allGoals Object to rotate through
    maxFontSize = 100,
    vertBar = false;

  //move to FIELDS
  let speed = 1, //seconds
      updatesPerInt = 2,
      percentageDigits = 1;
  //Grab HTML DOM nodes for moving stuff around
  const card = document.getElementById('card'),
    sides = ['front'];


  window.addEventListener('onWidgetLoad', obj => {
    let data = obj.detail.session.data,
      fieldData = obj.detail.fieldData;

      maxFontSize = fieldData[`FD_maxFontSize`] || 100;
      vertBar = fieldData[`FD_vertBar`] === 'yes';
      updatesPerInt = fieldData[`FD_updatesPerInt`] || 1;
      percentageDigits = fieldData[`FD_percentageDigits`] || 1;

      buildHTML(data, fieldData);
  });

  function buildHTML(data, fieldData) {

        let i = 'static-bar'; //lazy code. -array.forEach() override for single static bar

        const getIcon = selected => {
          if(selected === 'none') return ''
          else if(selected === 'other') return fieldData[`FD_${i}_iconOther`] || ''
          else return selected
        };

        allGoals[i] = { //build goal object with key name of goal i.e. 'tip-goal'
          progress: 0, //progress on load
          target: fieldData[`FD_${i}_target`] || 1000, //default 1000; get target goal amount from field data (use common FD names 'FD_tip-goal_target')
          label: fieldData[`FD_${i}_label`] || '', //default empty
          icon: getIcon(fieldData[`FD_${i}_icon`]),
          barColor1: fieldData[`FD_${i}_barColor1`],
          barColor2: fieldData[`FD_${i}_barColor2`],
        };
        goalList.push(i);

        speed = (allGoals[i].target/100/updatesPerInt);

     console.log('allGoals', allGoals);
    //build HTML for each
    buildBarHTML();
  };

  //build the HTML (called onLoad to build ALL the bars)
  function buildBarHTML() {
  //where to hide the bars (if not on front or back... hide it)
    let fontOptions = {minFontSize:10, maxFontSize: maxFontSize};
  //create each bar HTML based on the options. Only create the bars needed
    Object.keys(allGoals).forEach((goal, index) => {
  //make a new DOM node
      const goalContainer = document.createElement('div');
  //copy-pasta HTML code for each bar
      let barStyle = `
      width: ${(allGoals[goal].progress/allGoals[goal].target)*100}%;
      background: linear-gradient(90deg, ${allGoals[goal].barColor1}, ${allGoals[goal].barColor2});
      background-size: 400% 400%;
      transition: width ${allGoals[goal].target}s linear 0s;
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
        goalAmountString = `${allGoals[goal].target}`;
  //set values from settings/progress
      a.innerText = `99.99%`;
      //check if icon input is valid fontAweome or switch to text
      if(allGoals[goal].icon.includes('fa-')) b.innerHTML = `<i class="${allGoals[goal].icon.replace(/<i class=\"/g, '').replace(/\">/g, '').replace(/<\/i>/g, '')}"></i>`
      else b.innerText = allGoals[goal].icon;
      c.innerText = `99.99%`;
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
      a.querySelector('.textFitted').innerText = `${allGoals[goal].progress}%`;
      c.querySelector('.textFitted').innerText = `100%`;

      if (index == 0) document.getElementById(`${sides[0]}`).appendChild(goalContainer);
      else return;

      loadingTime(goal,document.getElementById(`${goal}_bar`));
    });
  };

  let loadingMsg = [
    "Loading     ",
    "Loading.    ",
    "Loading..   ",
    "Loading...  ",
    "Loading.... ",
    "Loading.....",
    "Loading.... ",
    "Loading...  ",
    "Loading..   ",
    "Loading.    "
  ];
  function loadingTime(goalName,barTarget, i = 0) {
    let timer = setInterval( () => {
      let progress = (allGoals[goalName].progress/allGoals[goalName].target*100);
      if(progress > 100) {
        clearInterval(timer);
        loadingEnd(goalName);
        return;
      };
      document.getElementById(`${goalName}_amount`).querySelector('.textFitted').innerText = `${parseFloat(progress).toFixed(percentageDigits)}%`;
      allGoals[goalName].progress += speed;
//      document.getElementById(`${goalName}_text`).querySelector('.textFitted').innerText = loadingMsg[i];
//      i++
//      if(i >= loadingMsg.length) i = 0;
//      loadingTime(goalName,barTarget,i);
    },speed*1000);
    setTimeout( () => barTarget.style.width = `100%`, speed*1000); //add delay to sync CSS transition to number value
  };

  function loadingEnd(goalName) {
    console.log('100% Loaded');
    //do something?
      document.getElementById(`${goalName}_amount`).querySelector('.textFitted').innerText = '';
      document.getElementById(`${goalName}_target`).querySelector('.textFitted').innerText = '';
      document.getElementById(`${goalName}_text`).querySelector('.textFitted').innerText = 'DONE';
  };
