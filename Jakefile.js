var fs = require( 'fs-extra' )
  , ncp = require( 'ncp' ).ncp
  , path = require( 'path' )
  , util = require( 'util' )
  , _ = require( 'underscore' );

var dev  = '/Users/john/Development';
var pub  = 'public';
var leaf = path.join( dev, pub, 'leaflet' );
var wax  = path.join( dev, pub, 'mapping', 'wax' );

var paths = {
  remote: [
    { src: path.join( wax, 'dist' ),
      dest: 'dist' },
    { src: path.join( leaf, 'Leaflet/dist' ),
      dest: 'dist' },
    { src: path.join( leaf, 'Leaflet.ajax/dist' ),
      dest: 'dist' },
    { src: path.join( leaf, 'Leaflet.pip/leaflet-pip.js' ),
      dest: 'dist/leaflet.pip.js' },
    { src: path.join( leaf, 'Leaflet.fullscreen/Control.Fullscreen.js' ),
      dest: 'dist/leaflet.fullscreen.js' },
    { src: path.join( leaf, 'Leaflet.fullscreen/Control.Fullscreen.css' ),
      dest: 'dist/leaflet.fullscreen.css' },
    { src: path.join( leaf, 'Leaflet.fullscreen/icon-fullscreen.png' ),
      dest: 'dist/icon-fullscreen.png' },
    { src: path.join( leaf, 'Leaflet.markercluster/dist/leaflet.markercluster-src.js' ),
      dest: 'dist/leaflet.markercluster-src.js' },
    { src: path.join( leaf, 'Leaflet.markercluster/dist/leaflet.markercluster.js' ),
      dest: 'dist/leaflet.markercluster.js' },
    { src: path.join( leaf, 'Leaflet.markercluster/dist/MarkerCluster.css' ),
      dest: 'dist/leaflet.markercluster.css' },
    { src: path.join( leaf, 'Leaflet.markercluster/dist/MarkerCluster.Default.css' ),
      dest: 'dist/leaflet.markercluster.default.css' },
    { src: path.join( leaf, 'Leaflet.dvf/dist/leaflet-dvf.js' ),
      dest: 'dist/leaflet.dvf.js' },
    { src: path.join( leaf, 'Leaflet.dvf/dist/css/dvf.css' ),
      dest: 'dist/leaflet.dvf.css' },
    { src: path.join( leaf, 'Leaflet.draw/dist' ),
      dest: 'dist' },
    { src: path.join( leaf, 'Leaflet.label/dist' ),
      dest: 'dist' },
    { src: path.join( leaf, 'Leaflet.hash/leaflet-hash.js' ),
      dest: 'dist/leaflet.hash.js' },
    { src: path.join( leaf, 'Leaflet.search/dist/leaflet-search.src.js' ),
      dest: 'dist/leaflet.search.js' },
    { src: path.join( leaf, 'Leaflet.search/dist/leaflet-search.src.css' ),
      dest: 'dist/leaflet.search.css' },
    { src: path.join( leaf, 'Leaflet.search/images' ),
      dest: 'dist/images' }
  ],
  local: [
    path.join( path.join( dev, '/home' ), 'janstreet/dist' )
  ]
};

//desc( 'Copy resources into dist' );
//task( 'build', function ()
//{
//  _.each( env[process.env.ENV || 'remote'], function ( files )
//  {
//    fs.copy( path.join( files.src ), path.join( __dirname, files.dest ), function ( err )
//    {
//      if ( err )
//      {
//        util.debug( "Problem with [" + files.src + "] - " + util.inspect( err, false, 10 ) );
//      }
//      else
//      {
//        console.log( "Added " + files.src + " to/as " + path.join( __dirname, files.dest ) )
//      }
//    } );
//  } );
//} )

task( 'default', ['build'] );


desc( 'Clean the dist dirs' );
task( 'clean', function ()
{
  fs.remove( 'dist/wax' );
  fs.remove( 'dist/leaflet' );
  fs.remove( 'dist/angular' );
} );

desc( 'Copy resources into dist' );
task( 'build', function ()
{
  _.each( paths[process.env.ENV || 'remote'], function ( files )
  {
    fs.copy( path.join( files.src ), path.join( __dirname, files.dest ),
       function ( file )
       {
         var res = file.toString().search( /\.js|\.png|\.css|\.jpg|\.map/ ) > 0;
         console.log( file.toString() + " match -> " + res );
         return res;
       },
       function ( err )
       {
         if ( err )
         {
           util.debug( "Problem with [" + files.src + "] - " + util.inspect( err, false, 10 ) );
         }
         else
         {
           console.log( "Added " + files.src + " to/as " + path.join( __dirname, files.dest ) )
         }
       } );
  } );
} );

task( 'default', ['build'] );

//var fs = require( 'fs-extra' )
//  , ncp = require( 'ncp' ).ncp
//  , path = require( 'path' )
//  , util = require( 'util' )
//  , _ = require( 'underscore' );
//
//var env = process.env;
//var dev = '../..';
//var pub = 'public';
//var leaflet = env.LEAFLET_PATH || path.join( dev, pub, 'leaflet' );
//var angular = env.ANGULAR_PATH || path.join( dev, pub, 'angular' );
//var wax     = env.WAX_PATH     || path.join( dev, pub, 'mapping', 'wax' )
//
//
//var paths = {
//  remote: [
//    { src: path.join( wax, 'dist' ),
//      dest: 'dist/wax' },
//    { src: path.join( angular, 'angular/build' ),
//      dest: 'dist/angular' },
//    { src: path.join( angular, 'angular.leaflet.directive/src' ),
//      dest: 'dist/angular' },
//    { src: path.join( leaflet, 'leaflet/dist' ),
//      dest: 'dist/leaflet' },
//    { src: path.join( leaflet, 'leaflet.ajax/dist' ),
//      dest: 'dist/leaflet' },
//    { src: path.join( leaflet, 'leaflet.draw/dist' ),
//      dest: 'dist/leaflet' },
//    { src: path.join( leaflet, 'leaflet.label/dist' ),
//      dest: 'dist/leaflet' },
//    { src: path.join( leaflet, 'leaflet.awesome.markers/dist' ),
//      dest: 'dist/leaflet' },
//    { src: path.join( leaflet, 'leaflet.playback/dist/LeafletPlaybackWithDeps.js' ),
//      dest: 'dist/leaflet/leaflet.playback.all.js' },
//    { src: path.join( leaflet, 'leaflet.playback/dist/LeafletPlayback.js' ),
//      dest: 'dist/leaflet/leaflet.playback.js' },
//    { src: path.join( leaflet, 'leaflet.pip/leaflet-pip.js' ),
//      dest: 'dist/leaflet/leaflet.pip.js' },
//    { src: path.join( leaflet, 'leaflet.fullscreen/Control.Fullscreen.js' ),
//      dest: 'dist/leaflet/leaflet.fullscreen.js' },
//    { src: path.join( leaflet, 'leaflet.fullscreen/Control.Fullscreen.css' ),
//      dest: 'dist/leaflet/leaflet.fullscreen.css' },
//    { src: path.join( leaflet, 'leaflet.fullscreen/icon-fullscreen.png' ),
//      dest: 'dist/leaflet/icon-fullscreen.png' },
//    { src: path.join( leaflet, 'leaflet.markercluster/dist/leaflet.markercluster-src.js' ),
//      dest: 'dist/leaflet/leaflet.markercluster-src.js' },
//    { src: path.join( leaflet, 'leaflet.markercluster/dist/leaflet.markercluster.js' ),
//      dest: 'dist/leaflet/leaflet.markercluster.js' },
//    { src: path.join( leaflet, 'leaflet.markercluster/dist/MarkerCluster.css' ),
//      dest: 'dist/leaflet/leaflet.markercluster.css' },
//    { src: path.join( leaflet, 'leaflet.markercluster/dist/MarkerCluster.Default.css' ),
//      dest: 'dist/leaflet/leaflet.markercluster.default.css' },
//    { src: path.join( leaflet, 'leaflet.dvf/dist/leaflet-dvf.js' ),
//      dest: 'dist/leaflet/leaflet.dvf.js' },
//    { src: path.join( leaflet, 'leaflet.dvf/dist/css/dvf.css' ),
//      dest: 'dist/leaflet/leaflet.dvf.css' },
//    { src: path.join( leaflet, 'leaflet.hash/leaflet-hash.js' ),
//      dest: 'dist/leaflet/leaflet.hash.js' },
//    { src: path.join( leaflet, 'Leaflet.draw/dist' ),
//      dest: 'dist/leaflet' },
//    { src: path.join( leaflet, 'Leaflet.label/dist' ),
//      dest: 'dist/leaflet' },
//    { src: path.join( leaflet, 'leaflet.search/dist/leaflet-search.src.js' ),
//      dest: 'dist/leaflet/leaflet.search.js' },
//    { src: path.join( leaflet, 'leaflet.search/dist/leaflet-search.src.css' ),
//      dest: 'dist/leaflet/leaflet.search.css' },
//    { src: path.join( leaflet, 'leaflet.search/images' ),
//      dest: 'dist/leaflet/images' }
//  ],
//  local: [
//    path.join( path.join( dev, '/home' ), 'janstreet/dist' )
//  ]
//};
//
//desc( 'Clean the dist dirs' );
//task( 'clean', function ()
//{
//  fs.remove( 'dist/wax' );
//  fs.remove( 'dist/leaflet' );
//  fs.remove( 'dist/angular' );
//} );
//
//desc( 'Copy resources into dist' );
//task( 'build', function ()
//{
//  _.each( paths[env.ENV || 'remote'], function ( files )
//  {
//    //console.log( files );
//    fs.copy( path.join( files.src ), path.join( __dirname, files.dest ),
//       function ( file )
//       {
//         console.log( files );
//         return file.toString().search( /\.js|\.png|\.css|\.jpg|\.map/ );
//       },
//       function ( err )
//       {
//         if ( err )
//         {
//           util.debug( "Problem with [" + files.src + "] - " + util.inspect( err, false, 10 ) );
//         }
//         else
//         {
//           console.log( "Added " + files.src + " to/as " + path.join( __dirname, files.dest ) )
//         }
//       } );
//  } );
//} );
//
//task( 'default', ['build'] );
