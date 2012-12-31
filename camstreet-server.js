var connect = require('connect')
  , fs      = require('fs')
  , ejs     = require('ejs')
  , util    = require('util')
  , browser = require('browserify')
  , sock    = require('socket.io')
  , geohash = require('geohash').GeoHash
  , path    = require('path');

var leaflet_host = "http://cdn.leafletjs.com/leaflet-0.4.4";
var draw_host    = "http://jacobtoye.github.com/Leaflet.draw";
var cam_host     = "http://localhost:3002";

var local = true;

var host = "192.168.1.3";
//var host = "192.168.0.101";
//var host = "192.168.43.71";
//var host = "127.0.0.1";

if ( local ) {
  connect()
    .use(connect.logger('dev'))
    .use(connect.static('/Users/john/Development/home/camstreet'))
    .listen(3003);

  cam_host = "http://" + host + ":3003";

  connect()
    .use(connect.logger('dev'))
    .use(connect.static('/Users/john/Development/home/jancourt'))
    .listen(3004);

  leaflet_host = "http://" + host + ":3004";

  connect()
    .use(connect.logger('dev'))
    .use(connect.static('/Users/john/Development/home/ameitstreet'))
    .listen(3005);
  draw_host = "http://" +  host + ":3005";

}

var model = {
  title   : "",
  host    : "http://" + host + ":3002",
  cam     : cam_host,
  leaflet : leaflet_host,
  draw    : draw_host
};

var render = function( req, res ) {
  return function( error, content ) {
    if ( error ) {
      res.writeHead(500, { 'Content-Type': 'text/html' });
      res.end(error);
    } else {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(ejs.render( content, model ));
    }
  };
};

var app = connect()
  .use(connect.logger('dev'))
  .use(connect.query())
  .use("/google", function(req,res) {
    fs.readFile(path.join(__dirname, 'views/google.ejs'), 'utf-8', render(req, res) )
  })
  .use("/leaflet", function(req,res) {
    fs.readFile(path.join(__dirname, 'views/leaflet.ejs'), 'utf-8', render(req, res) )
  })
  .use(browser({
    require : [
      'util',
      'underscore',
      'domready',
      'traverse',
      'date-utils',
      'jquery-browserify',
      'socket.io-browserify',
      'd3',
      path.join(__dirname, 'lib/geojson.js')
    ]
  }))
  .listen(3002);

var sockets = sock.listen(app);
sockets.set('log level', 1);
sockets.on('connection', function(socket) {
  console.log("Connection");
  socket.on('update', function( pos ) {
    console.log( geohash.encodeGeoHash( pos.latitude, pos.longitude ) )
  });

  socket.on("add", function( pos ) {
    util.debug( util.inspect( pos, false, 10, true ) );
    socket.broadcast.emit('update', pos );
//    console.log( geohash.encodeGeoHash( pos.latitude, pos.longitude ) )
  });

  fs.readFile(path.join(__dirname, 'data/test.json'), 'utf-8', function(error, content) {
    if ( error ) {
      socket.emit('update', error);
    } else {
//      setInterval( function(){
        socket.emit('update', JSON.parse( content ));
//      }, 5000 );
    }
  });
});
