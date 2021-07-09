const fs = require('fs'),
  path = require("path");

let platforms = ['Facebook','Twitch','Youtube', 'Trovo'],
  goals = [
    ["follower-goal", "Followers", "Facebook Twitch Trovo"],
    ["tip-goal", "Tips"],
    ["cheer-goal", "Cheers", "Twitch"],
    ["subscriber-goal", "Subscribers", "Twitch Youtube Trovo"],
    ["merch-goal-items", "Merch Items"],
    ["merch-goal-orders", "Merch Orders"],
    ["merch-goal-total", "Merch Total"],
    ["share-goal", "Shares", "Facebook"],
    ["stars-goal", "Stars", "Facebook"],
    ["supporter-goal", "Supporters","Facebook"],
    ["videolike-goal", "Video Likes", "Facebook"],
    ["sponsor-goal", "Sponsor","Youtube"],
    ["superchat-goal", "Superchats", "Youtube"],
    ["elixir-goal", "Elixir", "Trovo"],
  ],
fieldStringAll = `
{
  "FD_platform": {
    "type": "hidden",
    "label": "AiO RotatoGoal for {{PLATFORM}}",
    "value": "{{PLATFORM}}",
    "group": "Main"
  },
  "FD_cardBgColor1": {
    "type": "colorpicker",
    "label": "Card Color 1",
    "value": "rgba(255, 254, 254, 0)",
    "group": "Main"
  },
  "FD_cardBgColor2": {
    "type": "colorpicker",
    "label": "Card Color 2",
    "value": "rgba(0, 0, 0, 0.2)",
    "group": "Main"
  },
  "FD_cardEdgeColor": {
    "type": "colorpicker",
    "label": "Card Edge Color",
    "value": "rgba(0, 0, 0, 0.2)",
    "group": "Main"
  },
  "FD_barOnTop": {
      "type": "dropdown",
      "label": "Bar Position",
      "value": "0",
      "options": {
        "0": "Under Text",
        "2": "Above Text"
      },
      "group": "Main"
  },
  "FD_direction": {
      "type": "dropdown",
      "label": "Flip Direction",
      "value": "1",
      "options": {
        "-1": "Down",
        "1": "Up"
      },
      "group": "Main"
  },
  "FD_animationTime": {
  "type": "slider",
  "label": "Animation Speed",
  "value": 2,
  "min": 0.5,
  "max": 20,
  "steps": 0.5,
  "group": "Main"
  },
  "FD_showTime": {
  "type": "slider",
  "label": "Goal Duratation",
  "value": 10,
  "min": 1,
  "max": 300,
  "steps": 1,
  "group": "Main"
  },
  "FD_glowTime": {
  "type": "slider",
  "label": "Gradient Transistion (Seconds)",
  "value": 15,
  "min": 1,
  "max": 300,
  "steps": 1,
  "group": "Main"
  },
  "FD_fontName": {
    "type": "googleFont",
    "label": "Font Style",
    "value": "Bangers",
    "group": "Main"
  },
  "FD_fontColor": {
    "type": "colorpicker",
    "label": "Font Color",
    "value": "rgba(255, 255, 255, 0.75)",
    "group": "Main"
  },
  "FD_maxFontSize": {
  "type": "slider",
  "label": "Max Font Size",
  "value": 145,
  "min": 5,
  "max": 300,
  "steps": 1,
  "group": "Main"
  },
  "FD_fontShadowColor": {
    "type": "colorpicker",
    "label": "Font Shadow Color",
    "value": "rgb(0,0,0)",
    "group": "Main"
  },
  "FD_fontShadowSize": {
  "type": "slider",
  "label": "Font Shadow Size",
  "value": 1,
  "min": -15,
  "max": 15,
  "steps": 1,
  "group": "Main"
  },
  "FD_labelHeight": {
  "type": "slider",
  "label": "Label Height (Default: 20)",
  "value": 20,
  "min": 5,
  "max": 100,
  "steps": 1,
  "group": "Main"
  },
  "FD_labelPosition": {
  "type": "slider",
  "label": "Label Vertical Offset (Default: 0)",
  "value": 0,
  "min": -75,
  "max": 75,
  "steps": 1,
  "group": "Main"
  },
  "FD_labelColor": {
    "type": "colorpicker",
    "label": "Label Font Color",
    "value": "rgba(0, 195, 255, 0.9)",
    "group": "Main"
  },
  "FD_iconSize": {
  "type": "slider",
  "label": "Icon Size (Default: 100)",
  "value": 100,
  "min": 10,
  "max": 100,
  "steps": 1,
  "group": "Main"
  },
  "FD_iconOffset": {
  "type": "slider",
  "label": "Icon Vertical Offset (Default: 0)",
  "value": 0,
  "min": -75,
  "max": 75,
  "steps": 1,
  "group": "Main"
  },
  "FD_iconColor": {
    "type": "colorpicker",
    "label": "Icon Color",
    "value": "rgba(0, 195, 255, 0.9)",
    "group": "Main"
  },
  "FD_barGlowColor": {
    "type": "colorpicker",
    "label": "Bar Glow Color 1",
    "value": "rgba(0, 0, 0, 0.2)",
    "group": "Main"
  },
  "FD_barGlowColor2": {
    "type": "colorpicker",
    "label": "Bar Glow Color 2",
    "value": "rgba(255, 255, 255, 0.75)",
    "group": "Main"
  },
  "FD_barGlowWidth": {
  "type": "slider",
  "label": "Bar Glow Width",
  "value": 10,
  "min": 0,
  "max": 50,
  "steps": 1,
  "group": "Main"
  },

  "FD_cardPerspective": {
  "type": "slider",
  "label": "Card Perspective (Default: 1500)",
  "value": 1500,
  "min": 0,
  "max": 5000,
  "steps": 100,
  "group": "Advanced"
  },
  "FD_cardPerspectiveOrigin": {
      "type": "dropdown",
      "label": "Perspective Origin",
      "value": "top left",
      "options": {
        "top left": "TOP LEFT",
        "top": "TOP",
        "top right": "TOP RIGHT",
        "left": "LEFT",
        "center": "CENTER",
        "right": "RIGHT",
        "bottom left": "BOTTOM LEFT",
        "bottom": "BOTTOM",
        "bottom right": "BOTTOM RIGHT"
      },
      "group": "Advanced"
  },
"_FD_info1_hidden": {
  "type": "hidden",
  "label": "RADIUS OR THICKNESS | NOT BOTH!",
  "group": "Advanced"
},
"FD_cardRadius": {
"type": "slider",
"label": "Card Radius (Pixels)",
"value": 0,
"min": 0,
"max": 500,
"steps": 1,
"group": "Advanced"
},
"FD_cardThickness": {
"type": "slider",
"label": "Card Thickness (Pixels)",
"value": 30,
"min": 0,
"max": 150,
"steps": 1,
"group": "Advanced"
},
"FD_cardWidth": {
"type": "slider",
"label": "Card Width Override (Default: 80)",
"value": 80,
"min": 5,
"max": 95,
"steps": 5,
"group": "Advanced"
},
"FD_cardHeight": {
"type": "slider",
"label": "Card Height Override (Default: 80)",
"value": 80,
"min": 5,
"max": 95,
"steps": 5,
"group": "Advanced"
},
"FD_currencyLocale": {
    "type": "dropdown",
    "label": "Currency Locale",
    "value": "en-US",
    "options": {
      "de-DE": "de-DE",
      "en-AU": "en-AU",
      "en-CA": "en-CA",
      "en-GB": "en-GB",
      "en-IE": "en-IE",
      "en-NZ": "en-NZ",
      "en-US": "en-US",
      "ja-JP": "ja-JP",
      "nl-NL": "nl-NL",
      "zh-HK": "zh-HK"
    },
    "group": "Advanced"
},
"FD_currencyDecimals": {
    "type": "dropdown",
    "label": "Currency Decimals",
    "value": "2",
    "options": {
      "0": "$10",
      "2": "$10.00"
    },
    "group": "Advanced"
},
"FD_currencyCode": {
    "type": "hidden",
    "label": "",
    "value": "en-US",
    "options": {
      "EUR": "EUR",
      "GBP": "GBP",
      "HKD": "HKD",
      "JPY": "JPY",
      "USD": "USD"
    },
    "group": "Advanced"
},
"FD_vertBar": {
    "type": "dropdown",
    "label": "Vertical Bar",
    "value": "no",
    "options": {
      "yes": "Yes",
      "no": "No"
    },
    "group": "Advanced"
},


`;


platforms.forEach(p => {
  let fieldString = fieldStringAll

  goals.map(i => {

    console.log(p , i , !i[2] || i[2].includes(p)); //platform / goal array / is this a goal for this platform?
    if( !i[2] || i[2].includes(p)) { //check if the goal has a platform restriction; if it does; check if matches.

    let formatName = i[0].replace('-goal', ''),
      optionsObj = {};

    if(i[0].includes('merch')) { //merch do not have session/week/month/total
    optionsObj = {
      "off": "Disabled",
      [i[0]]: "Goal"
    };
    } else {
      optionsObj = {
        "off": "Off",
        [`${formatName}-goal`]: "Goal",
        [`${formatName}-session`]: "Session",
        [`${formatName}-week`]: "Week",
        [`${formatName}-month`]: "Month",
        [`${formatName}-total`]: "Total",
    };
  };
  console.log(`${JSON.stringify(optionsObj)}`);

//TIP COUNT ADD IN
      if(formatName === 'tip') optionsObj[`${formatName}-count`] = "Count";
//


    formatName = formatName.replace('-', ' ').toUpperCase();
    fieldString += `

    "_FD_${i[0]}_hidden": {
      "type": "hidden",
      "label": "${formatName} Options",
      "group": "${i[1]}"
    },
    "FD_${i[0]}_enabled": {
        "type": "dropdown",
        "label": "${formatName} Type",
        "value": "off",
        "options": ${JSON.stringify(optionsObj)},
        "group": "${i[1]}"
    },
    "FD_${i[0]}_target": {
      "type": "number",
      "label": "${formatName} Target Goal",
      "step": 1,
      "value": 10,
      "min": 1,
      "group": "${i[1]}"
    },

    "FD_${i[0]}_icon": {
        "type": "dropdown",
        "label": "${formatName} Icon",
        "value": "other",
        "options": {
          "none": "NONE",
          "fab fa-twitch": "TWITCH",
          "fab fa-youtube": "YOUTUBE",
          "fab fa-facebook-f": "FACEBOOK",
          "fas fa-crown": "CROWN",
          "fas fa-chess-queen": "CHESS QUEEN",
          "fas fa-donate": "DONATE",
          "fas fa-coins": "COINS",
          "fas fa-gem": "GEM SOLID",
          "far fa-gem": "GEM",
          "fas fa-tshirt": "TSHIRT",
          "fas fa-puzzle-piece": "PUZZLE PIECE",
          "fas fa-star": "STAR SOLID",
          "far fa-star": "STAR",
          "other": "OTHER/TEXT: ENTER ICON CLASS / TEXT BELOW"
        },
        "group": "${i[1]}"
    },
    "_FD_${i[0]}_hidden2": {
      "type": "hidden",
      "label": "Enter Icon Class Or Text",
      "group": "${i[1]}"
    },
    "_FD_${i[0]}_hidden3": {
      "type": "hidden",
      "label": "Icons: fontawesome.com/icons?m=free",
      "group": "${i[1]}"
    },
    "FD_${i[0]}_iconOther": {
      "type": "text",
      "label": "Emotes: https://static-cdn.jtvnw.net/emoticons/v1/166263/3.0",
      "value": "fas fa-code",
      "group": "${i[1]}"
    },
    "FD_${i[0]}_label": {
      "type": "text",
      "label": "${formatName} Label",
      "value": "${formatName}",
      "group": "${i[1]}"
    },
    "FD_${i[0]}_barColor1": {
      "type": "colorpicker",
      "label": "${formatName} Bar Color 1",
      "value": "rgba(0, 0, 0, 0.25)",
      "group": "${i[1]}"
    },
    "FD_${i[0]}_barColor2": {
      "type": "colorpicker",
      "label": "${formatName} Bar Color 2",
      "value": "rgba(0, 195, 255, 0.3)",
      "group": "${i[1]}"
    },
    "FD_${i[0]}_neverEndingGoal": {
      "type": "dropdown",
      "label": "Goal That Never Ends?",
      "value": "no",
      "options": {
        "yes": "Yes",
        "no": "No"
      },
      "group": "${i[1]}"
    },
    "FD_${i[0]}_neverEndingGoalAdder": {
      "type": "slider",
      "label": "% Adder At Limit",
      "value": 25,
      "min": 1,
      "max": 50,
      "steps": 1,
      "group": "${i[1]}"
    },
    "FD_${i[0]}_neverEndingGoalLimit": {
      "type": "slider",
      "label": "Maximum Bar %",
      "value": 90,
      "min": 50,
      "max": 99,
      "steps": 1,
      "group": "${i[1]}"
    },`

  } else return;
  }),
  finalString = fieldString.slice(0, -1).replace(/{{PLATFORM}}/g, p).concat('}'); //remove last comma in object, add end bracket and set platform

  fs.writeFileSync(path.resolve(__dirname, `./fieldData_${p}.json`),  finalString, 'UTF-8')


});

console.log('done')
