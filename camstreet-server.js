var connect = require('connect')
  , fs      = require('fs')
  , ejs     = require('ejs')
  , browser = require('browserify')
  , sock    = require('socket.io')
  , path    = require('path');

var __MAP__ = 'google';
//var __MAP__ = 'leaflet';

var app = connect()
  .use(connect.logger('dev'))
  .use(connect.query())
  .use("/unit", function(req,res) {
    fs.readFile(path.join(__dirname, 'views/unit-' + __MAP__ + '.ejs'), 'utf-8', function(error, content) {
      if ( error ) {
        res.writeHead(500, { 'Content-Type': 'text/html' });
        res.end(error);
      } else {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(ejs.render(content, {
          title: ""
        }));
      }
    })
  })
  .use("/ctrl", function(req,res) {
    fs.readFile(path.join(__dirname, 'views/ctrl.ejs'), 'utf-8', function(error, content) {
      if ( error ) {
        res.writeHead(500, { 'Content-Type': 'text/html' });
        res.end(error);
      } else {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(ejs.render(content, {
          title: ""
        }));
      }
    })
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
  socket.on('update', function(message) {
    console.log( message );
  });

  fs.readFile(path.join('/Users/john/Downloads/Shape/688567-1220267-20110107193647/test.json'), 'utf-8', function(error, content) {
    if ( error ) {
      socket.emit('update', error);
    } else {
      socket.emit('update', JSON.parse( content ));
    }
  });

/*
  setInterval( function(){
    socket.emit('update', {
      "type": "LineString",
      "coordinates": [
        [-37.8,  144.6],
        [-37.7,  144.6],
        [-37.7,  144.5],
        [-37.8,  144.5]
      ]
    })
  }, 15000 );
*/

  setInterval( function(){
    socket.emit('update', {
      "type": "Point",
      "coordinates": [144.83152397862716, -36.667842160163261]
    })
  }, 5000 );


});
