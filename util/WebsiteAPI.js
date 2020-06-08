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
        .then(async response => {
          if (!response.ok) {
            console.log(await response.json());
            throw new Error();
          };
          resolve(response.json());
        })
        .catch(error => {
          console.error(`Error Getting ${user}'s Twitch ID`)
          resolve(false);
        });
    });
  },
  getDiscordID: (id) => {
    return new Promise((resolve, reject) => {
      fetch(`https://pjtestsite.herokuapp.com/api/discordid/${id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          },
        })
        .then(async response => {
          if (!response.ok) {
            console.log(await response.json());
            throw new Error();
          };
          resolve(response.json());
        })
        .catch(error => {
          console.error(`Error Discord ID for ${id}`)
          resolve(false);
        });
    });
  }
};
