const fetch = require('node-fetch');

module.exports = {
  getTwitchID: (username) => {
    return new Promise((resolve, reject) => {
      fetch(`https://api.twitch.tv/helix/users?login=${username}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.T_BOTOAUTHTOKEN}`,
            'Client-ID': process.env.T_APPCLIENTID
          },
        })
        .then(response => response.json())
        .then(data => {
          resolve(data);
        })
        .catch(error => {
          console.error(error, `Error Getting ${username}'s Twitch ID ^^...`)
          reject();
        });
    });
  },
  GetStreamData: (userID) => {
    return new Promise((resolve, reject) => {
      fetch(`https://api.twitch.tv/helix/streams?user_id=${userID}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.T_BOTOAUTHTOKEN}`,
            'Client-ID': process.env.T_APPCLIENTID
          },
        })
        .then(response => response.json())
        .then(data => {
          resolve(data);
        })
        .catch(error => {
          console.error(error, `!!!Error Getting Twitch Stream Data ^^...`)
          reject();
        });
    });
  },
  GetGameData: (gameID) => {
    return new Promise((resolve, reject) => {
      fetch(`https://api.twitch.tv/helix/games?id=${gameID}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.T_BOTOAUTHTOKEN}`,
            'Client-ID': process.env.T_APPCLIENTID
          },
        })
        .then(response => response.json())
        .then(data => {
          resolve(data);
        })
        .catch(error => {
          console.error(error, `!!!Error Getting Twitch Game Data ^^...`)
          reject();
        });
    });
  }
}; //end exports
