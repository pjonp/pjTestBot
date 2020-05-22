const path = require("path"),
  fetch = require('node-fetch'),
  setup = require('../.hidden/settings.json');

  module.exports = {
    GetPointsFromSE: (username) => {
      return fetch(`https://api.streamelements.com/kappa/v2/points/${setup.SE_ACCOUNTID}/${username}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${setup.SE_JWTTOKEN}`
          },
        })
        .then(async response => {
          if (!response.ok) {
            console.log(await response.json());
            throw new Error();
          };
          return response.json();
        })
        .catch(error => {
          console.error(`Error Reading Points for ${username}`)
          return false;
        });
    },
    PutPointsToSE: (username, points) => {
      return fetch(`https://api.streamelements.com/kappa/v2/points/${setup.SE_ACCOUNTID}/${username}/${points}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${setup.SE_JWTTOKEN}`
          },
        })
        .then(async response => {
          if (!response.ok) {
            console.log(await response.json());
            throw new Error();
          };
          return response.json();
        })
        .catch(error => {
          console.error(`Error Saving/Removing Points for ${username}`)
          return false;
        });
    },
    BulkPutPointsToSE: (userNames, points) => {
      let SEUserObject = userNames.map(i => {
          return {
            "username": i,
            "current": points
          }
        }),
        SEDataObject = {
          "mode": "add",
          "users": SEUserObject
        };
      return fetch(`https://api.streamelements.com/kappa/v2/points/${setup.SE_ACCOUNTID}/`, {
          method: 'PUT',
          body: JSON.stringify(SEDataObject),
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${setup.SE_JWTTOKEN}`
          },
        })
        .then(async response => {
          if (!response.ok) {
            console.log(await response.text());
            throw new Error();
          }
          console.log('Successfully Bulk Updated Leaderboard')
          return response.text();
        })
        .catch(error => {
          console.error('Error Saving Bulk Points:', error)
          return false;
        });
    }
  };
