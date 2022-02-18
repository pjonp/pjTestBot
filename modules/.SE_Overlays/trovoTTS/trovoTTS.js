let fieldData,
  apiKey,
  userCooldown = [],
  lastMessages = [],
  allUsers = [],
  audioStream = [],
  chunks = 0;

/*
TODO:
[]: add queue (maybe)
*/

window.addEventListener('onWidgetLoad', obj => {
  fieldData = obj.detail.fieldData;
  apiKey = obj.detail.channel.apiToken;
});

window.addEventListener('onEventReceived', obj => {
  const listener = obj.detail.listener;
  const data = obj.detail.event.data;
  if (listener === 'message' && data.content_data) {
    const user = data.nick_name;
    if (data.content.startsWith(`${fieldData._command} `)) handleTts(data.content, user);
    else if (fieldData._autoAnnounce === 'yes' && allUsers.indexOf(user) === -1) handleTts(data.content, user);
  } else if (obj.detail.event.listener === 'widget-button' && obj.detail.event.field === '_Ttstestbutton') handleTts('Text to speech test the quick brown fox jumps over the lazy dog', 'pjonp')
});

function handleTts(msg, user) {
  if (chunks > 0) return console.log('TTS Skipped because one is currenlty in progress.');
  msg = msg.replace(`${fieldData._command} `, '').slice(0, fieldData._maxCharacters);;
  if (!msg[2]) return; //minimum 3 character message
  if (userCooldown.indexOf(user) > -1 || lastMessages.indexOf(msg) > -1) {
    console.log(`${user} or same message is on cooldown.`);
    return;
  };
  allUsers.push(user);
  userCooldown.push(user);
  lastMessages.push(msg);
  console.log(`${user} added to cooldown.`);

  setTimeout(_ => {
    userCooldown.shift();
    lastMessages.shift();
    console.log(`${user} removed from cooldown.`);
  }, fieldData._coolDown * 1000);

  const apiLink = 'https://api.streamelements.com/kappa/v2/speech';
  const ttsVoice = 'en-AU-Standard-C';
  const ttsText = 'null';

  msg = `${fieldData._prefix.replace('{user}', user)} ${msg}`;
  SE_API.sanitize({
    message: msg
  }).then(sanityResult => {
    if (sanityResult.skip) return;
    msg = encodeURIComponent(sanityResult.result.message);
    fetch(`${apiLink}?voice=${fieldData._voice}&text=${msg}&key=${apiKey}`)
      .then(res => {
        if (!res.ok) throw new Error(`Error using this voice; Status: ${res.status}`);
        const reader = res.body.getReader();
        reader.read().then(function processText({ done,value }) {
          chunks++;
          if (done) {
            const blob = new Blob(audioStream, {
              type: 'audio/mp3'
            });
            audioStream = [];
            chunks = 0;
            const audio = new Audio();
            audio.src = URL.createObjectURL(blob);
            setTimeout(_ => {
              audio.volume = fieldData._volume / 100 || 1;
              console.log(`Playing TTS audio for ${audio.duration} seconds.`);
              audio.play();
            }, 500);
            return;
          } else if (chunks > 15) {
            chunks = 0;
            audioStream = [];
            throw new Error(`Chunk amount exceeded. TTS cancelled.`);
          };
          audioStream = [...audioStream, value];
          return reader.read().then(processText);
        }).catch(e => console.log(e));
      })
      .catch(e => console.log(e));
  });
};
