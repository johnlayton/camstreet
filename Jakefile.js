var fs   = require('fs-extra' )
  , ncp  = require('ncp' ).ncp
  , path = require('path')
  , util = require('util')
  , _    = require('underscore');

var dev  = '/Users/john/Development'

var env = {
  remote: [
    { src: path.join( path.join( dev , '/public' ), 'wax/dist' ),
      dest: 'dist' },
    { src: path.join( path.join( dev , '/public' ), 'wax/dist' ),
      dest: 'dist' },
    { src: path.join( path.join( dev , '/public' ), 'Leaflet/dist' ),
      dest: 'dist' },
    { src: path.join( path.join( dev , '/public' ), 'Leaflet.ajax/dist' ),
      dest: 'dist' },
    { src: path.join( path.join( dev , '/public' ), 'Leaflet.dvf/dist/leaflet-dvf.js' ),
      dest: 'dist/leaflet.dvf.js' },
    { src: path.join( path.join( dev , '/public' ), 'Leaflet.dvf/dist/css/dvf.css' ),
      dest: 'dist/leaflet.dvf.css' },
    { src: path.join( path.join( dev , '/public' ), 'Leaflet.draw/dist' ),
      dest: 'dist' },
    { src: path.join( path.join( dev , '/public' ), 'Leaflet.label/dist' ),
      dest: 'dist' },
    { src: path.join( path.join( dev , '/public' ), 'Leaflet.hash/leaflet-hash.js' ),
      dest: 'dist/leaflet-hash.js' },
    { src: path.join( path.join( dev , '/public' ), 'Leaflet.search/leaflet-search.js' ),
      dest: 'dist/leaflet-search.js' },
    { src: path.join( path.join( dev , '/public' ), 'Leaflet.search/leaflet-search.css' ),
      dest: 'dist/leaflet-search.css' },
    { src: path.join( path.join( dev , '/public' ), 'Leaflet.search/images' ),
      dest: 'dist/images' }
  ],
  local: [
    path.join( path.join( dev , '/home' ), 'janstreet/dist' )
  ]
};

desc('Copy resources into dist');
task('build', function () {
  _.each(env[process.env.ENV || 'remote'], function( files ){
    fs.copy(path.join(files.src), path.join(__dirname, files.dest), function( err ){
      if (err) {
        util.debug( "Problem with [" + files.src + "] - " + util.inspect( err, false, 10 ) );
      }
      else {
        console.log("Added " + files.src + " to/as " + path.join(__dirname, files.dest))
      }
    });
  });
})

task('default', ['build']);
