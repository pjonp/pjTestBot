const fetch = require('node-fetch');

module.exports = {
  getDiscordID: (id) => {
    return new Promise((resolve, reject) => {
      fetch(`https://pjtestsite.herokuapp.com/api/discordid/${id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          },
        })
        .then(response => response.json())
        .then(data => {
          resolve(data);
        })
        .catch(error => {
          console.error(error, `Error Getting Discord ID for ${id} ^^...`)
          reject();
        });
    });
  }
};
