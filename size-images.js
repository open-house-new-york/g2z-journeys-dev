const fs = require('fs');
const sizeOf = require('image-size');
const junk = require('junk');

var journeySlugs = ['curb-to-landfill', 'history', 'recyclables', 'organics', 'incineration', 'commercial'];

for (var j = 0; j < journeySlugs.length; j++) {
  var folderPath = 'app/images/' + journeySlugs[j] + '/';
  var files = fs.readdirSync(folderPath);
  files = files.filter(junk.not);
  var sizes = [];

  for (var i = 0; i < files.length; i++) {
    var dimensions = sizeOf(folderPath + files[i]);
    dimensions.filename = files[i];
    sizes.push(dimensions);
  }

  console.log(journeySlugs[j], sizes);

  fs.writeFileSync('app/scripts/sizes/' + journeySlugs[j] + '-sizes.js', 'var visImageSizes \= ' + JSON.stringify(sizes) + '\;');
}
