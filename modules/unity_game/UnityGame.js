const Overlay = require('../../pjtestbot.js').OVERLAYS;

module.exports = {
  settings: 'settings',
  main: (TWITCHBOT, room, user, message) => {
    /*if (settings.subMode && !user.subscriber) { //subMode
      return;
    };*/
    let res = {
        direction: '',
        user: user.username
      };
    if(message === 'up'){
      res.direction = 'up';
    } else if(message === 'down'){
      res.direction = 'down';
    } else if(message === 'left') {
      res.direction = 'left';
    } else if(message === 'right') {
      res.direction = 'right';
    } else {
      return;
    };
    Overlay.emit('gameMovement', res);
  },
  update: async (TWITCHBOT, room, user, message) => {
  }
};
