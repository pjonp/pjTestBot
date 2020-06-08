module.exports = {
  chatCommand: "%help",
  about: "List Discord Commannds",
  main: (message, commands) => {
    if (!message.member.hasPermission('MANAGE_ROLES')) return;

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
          "text": '¯\\_(ツ)_/¯ | This message will delete in 30 seconds'
        },
        "thumbnail": {
          "url": 'https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/160/google/40/thinking-face_1f914.png'
        },
        "fields": fields
      };
      message.channel.send({embed}).then(msg => msg.delete({timeout: 30000}));
    }).catch(error => console.error(error, '!! Discord Help Command Error ^^^ ....'));
  }
}; //end exports
