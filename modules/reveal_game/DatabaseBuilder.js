const fs = require('fs'),
  path = require("path");


module.exports = {
  main: (message, commands) => {
    fs.readdir(path.resolve(__dirname, './images'), (err, files) => {
      if (err) console.error(err);
      console.log(`Loading a total of ${files.length} images.`);
      console.log(files);
      let imageObject = files.map(file => {
        return {
          "name": file.replace('.jpg', '').replace('.png', '').replace('.jpeg', '').toLowerCase(),
          "image": `https://raw.githubusercontent.com/pjonp/pjTestBot/master/modules/reveal_game/images/${file}`
        }
      });
      console.log('!done');
      fs.writeFileSync(path.resolve(__dirname, './testDatabase.json'), JSON.stringify(imageObject, null, 4), 'UTF-8')
    }); //fs
  }
}; //end exports
