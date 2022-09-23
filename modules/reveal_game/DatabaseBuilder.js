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
          "image": encodeURI(`https://raw.githubusercontent.com/pjonp/pjTestBot/master/modules/reveal_game/images/${file}`)
        }
      });
      console.log('!done');
      fs.writeFileSync(path.resolve(__dirname, './testDatabase.json'), JSON.stringify(imageObject, null, 4), 'UTF-8')
    });
  },
  fileNames: (message, commands) => {
    fs.readdir(path.resolve(__dirname, './images'), (err, files) => {
      if (err) console.error(err);
      console.log(`Loading a total of ${files.length} images.`);
      console.log(files);
      let imageObject = files.map(file => file.replace('.jpg', '').replace('.png', '').replace('.jpeg', '').toLowerCase());
      console.log('!done');
      fs.writeFileSync(path.resolve(__dirname, './testDatabaseNames.json'), JSON.stringify(imageObject, null, 4), 'UTF-8')
    });
  },
  wheelObject: (message, commands) => {
    fs.readdir(path.resolve(__dirname, './images/trainers'), (err, files) => {
      if (err) console.error(err);
      console.log(`Loading a total of ${files.length} images.`);
      console.log(files);
      let i = -1;
      const imageObject = files.map(file => {
        i++;
        return {
          "index": i,
          "text": file.replace('.jpg', '').replace('.png', '').replace('.jpeg', ''),
          "image": encodeURI(`https://raw.githubusercontent.com/pjonp/pjTestBot/master/modules/reveal_game/images/trainers/${file}`),
          "fillStyle":"{{seg3Color}}"
        }
      });
      console.log('!done');
      fs.writeFileSync(path.resolve(__dirname, './testDatabase.json'), JSON.stringify(imageObject, null, 4), 'UTF-8')
    });
  },
}; //end exports

//run
module.exports.wheelObject();
