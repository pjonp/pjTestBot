let embedThumbnail = 'https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/160/google/40/thinking-face_1f914.png';
module.exports = {
  chatCommand: "%help",
  about: "List Discord Commands",
  main: (message, commands) => {
  //  if (!message.member.hasPermission('MANAGE_ROLES')) return;

    message.delete().then(() => {
      let fields = commands.map(i => {
        return {
          name: i.chatCommand,
          value: `\`\`\`css\n${i.about}\`\`\``
        };
      }),
      embed = {
        "color": 13632027,
        "timestamp": new Date(),
        "footer": {
          "text": '¯\\_(ツ)_/¯'
        },
        "thumbnail": {
          "url": embedThumbnail
        },
        "fields": fields
      };
      message.channel.send({embed}).then(msg => msg.delete({timeout: 30000}));
    }).catch(error => console.error(error, '!! Discord Help Command Error ^^^ ....'));
  }
}; //end exports
