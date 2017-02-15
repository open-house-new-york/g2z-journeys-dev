const fs = require('fs');
const sizeOf = require('image-size');
const junk = require('junk');

var folderPath = 'app/images/'
var files = fs.readdirSync(folderPath);
files = files.filter(junk.not);
var sizes = [];

for (var i = 0; i < files.length; i++) {
  var dimensions = sizeOf(folderPath + files[i]);
  dimensions.filename = files[i];
  sizes.push(dimensions);
}

console.log(sizes);

fs.writeFileSync('app/scripts/sizes.js', 'var vizImageSizes \= ' + JSON.stringify(sizes) + '\;');
