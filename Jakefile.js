//var fs = require('fs');
var fs   = require('fs-extra')
  , path = require('path');

desc('Copy Leaflet and Leaflet.Draw resources into dist');
task('build', function () {
  fs.copy(path.join(__dirname, '../jancourt/dist'), path.join(__dirname, 'dist'), function(err){
    if (err) {
      console.error(err);
    }
    else {
      console.log("success!")
    }
  });
  fs.copy(path.join(__dirname, '../ameitstreet/dist'), path.join(__dirname, 'dist'), function(err){
    if (err) {
      console.error(err);
    }
    else {
      console.log("success!")
    }
  });
});

task('default', ['build']);
