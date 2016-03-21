var connect = require( 'connect' )
  , express = require( 'express' )
  , fs = require( 'fs' )
  , ejs = require( 'ejs' )
  , util = require( 'util' )
  , browser = require( 'browserify' )
  , path = require( 'path' )
  , oppressor = require( 'oppressor' )
  , _ = require( 'underscore' )
  , uuid = require( 'node-uuid' )
  , http = require( 'http' )
  , colors = require( 'colors' )
  , brfs = require( 'brfs' )
  , proxy = require( 'proxy-middleware' )
  , url = require( 'url' )
  , morgan = require( 'morgan' )
  , through = require( 'through' )
  , errorhandler = require( 'errorhandler' )
  , merge = require( './lib/camstreet.merge.js' );


var nano = require( 'nano' )( 'http://localhost:5984' );
var db_name = "places";
var db = nano.use( db_name );

//http://localhost:5984/places/_design/main/_spatial/points?bbox=143,-45,160,-35
nano.db.create( db_name, function () {
  db.insert(
    { "spatial" : {
      "points" : function ( doc ) {
        if ( doc.geometry.coordinates ) {
          emit( { type    : "Point",
              coordinates : [doc.geometry.coordinates[0], doc.geometry.coordinates[1]]
            }, [doc._id, doc.geometry]
          );
        }
      }
    }
    },
    '_design/main',
    function ( err, res ) {
      if ( err ) {
        debug( 'Failure', util.inspect( err ) );
      }
      else {
        debug( 'Success', util.inspect( res ) );
      }
    }
  );
} );

var app = express();

app.set( 'port', process.env.PORT || 3003 );
app.set( 'views', __dirname + '/views' );
app.set( 'view engine', 'ejs' );

/*
 var cross = function ( req, res, next ) {
 res.header( 'Access-Control-Allow-Origin', '*' );
 res.header( 'Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS' );
 res.header( 'Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With' );
 if ( 'OPTIONS' == req.method ) {
 res.send( 200 );
 }
 else {
 next();
 }
 };
 */

/*
 app.configure( function () {
 app.set( 'port', process.env.PORT || 3000 );
 app.set( 'views', __dirname + '/views' );
 app.set( 'view engine', 'ejs' );
 app.use( cross );
 app.use( express.favicon() );
 app.use( express.logger( 'dev' ) );
 app.use( express.bodyParser() );
 app.use( express.methodOverride() );
 app.use( app.router );
 app.use( require( 'less-middleware' )( {
 src: path.join( __dirname, '/less' ), dest: path.join( __dirname, '/public' )
 } ) );
 app.use(sass.middleware({
 src:   path.join( __dirname, '/sass' )
 , dest:  path.join( __dirname, '/public' )
 , debug: true
 }));
 app.use( connect.static( path.join( __dirname ) ) );
 app.use('/thredds', proxy(url.parse('http://localhost:8080/thredds')));
 } );

 app.configure( 'development', function () {
 app.use( express.errorHandler( { dumpExceptions: true, showStack: true } ) );
 } );
 */

var host =

  app.get( "/", function ( req, res ) {
    var agent = req.headers['user-agent'];
    res.render( 'index', {
      title : 'Welcome',
      agent : agent
    } );
  } );

app.get( "/coverage", function ( req, res ) {
  var agent = req.headers['user-agent'];
  res.render( 'coverage', {
    title : 'Coverage Demo',
    agent : agent
  } );
} );

app.get( "/polymer", function ( req, res ) {
  var agent = req.headers['user-agent'];
  res.render( 'polymer', {
    title : 'Polymer Demo',
    agent : agent
  } );
} );

app.get( "/wax", function ( req, res ) {
  var agent = req.headers['user-agent']
  res.render( 'wax', {
    title : 'Wax Demo',
    agent : agent
  } );
} );

app.get( "/terrain", function ( req, res ) {
  var agent = req.headers['user-agent']
  res.render( 'terrain', {
    title : 'Terrain Demo',
    agent : agent
  } );
} );

app.get( "/elevation", function ( req, res ) {
  var agent = req.headers['user-agent']
  res.render( 'elevation', {
    title : 'Elevation Demo',
    agent : agent
  } );
} );

app.get( "/google", function ( req, res ) {
  var agent = req.headers['user-agent']
  res.render( 'google', {
    title : 'Google Demo',
    agent : agent
  } );
} );

app.get( "/regions", function ( req, res ) {
  var agent = req.headers['user-agent']
  res.render( 'regions', {
    title : 'Regions Demo',
    agent : agent
  } );
} );

app.get( "/notification", function ( req, res ) {
  var agent = req.headers['user-agent']
  res.render( 'notification', {
    title : 'Notification Demo',
    agent : agent
  } );
} );

app.get( "/drawing", function ( req, res ) {
  var agent = req.headers['user-agent']
  res.render( 'drawing', {
    title : 'Drawing Demo',
    agent : agent
  } );
} );

app.get( "/availability", function ( req, res ) {
  var agent = req.headers['user-agent']
  res.render( 'availability', {
    title : 'Availability Demo',
    agent : agent
  } );
} );

app.get( "/clustering", function ( req, res ) {
  var agent = req.headers['user-agent']
  res.render( 'clustering', {
    title : 'Clustering Demo',
    agent : agent
  } );
} );

app.get( "/temporal", function ( req, res ) {
  var agent = req.headers['user-agent']
  res.render( 'temporal', {
    title : 'Temporal Demo',
    agent : agent
  } );
} );

app.get( "/following", function ( req, res ) {
  var agent = req.headers['user-agent']
  res.render( 'following', {
    title : 'Following  Demo',
    agent : agent
  } );
} );

app.get( "/hashing", function ( req, res ) {
  var agent = req.headers['user-agent']
  res.render( 'hashing', {
    title : 'Hashing  Demo',
    agent : agent
  } );
} );

app.get( "/search", function ( req, res ) {
  var agent = req.headers['user-agent']
  res.render( 'search', {
    title : 'Search  Demo',
    agent : agent
  } );
} );

app.get( "/firebase", function ( req, res ) {
  var agent = req.headers['user-agent']
  res.render( 'firebase', {
    title : 'Firebase  Demo',
    agent : agent
  } );
} );

app.get( "/firebase/show", function ( req, res ) {
  var agent = req.headers['user-agent']
  res.render( 'firebase_show', {
    title : 'Firebase  Demo',
    agent : agent
  } );
} );

app.get( "/resources", function ( req, res ) {
  var agent = req.headers['user-agent']
  res.render( 'resources', {
    title : 'Resources  Demo',
    agent : agent
  } );
} );

app.get( "/baselayers", function ( req, res ) {
  var agent = req.headers['user-agent']
  res.render( 'baselayers', {
    title : 'Base Layers  Demo',
    agent : agent
  } );
} );

app.get( "/tracking", function ( req, res ) {
  var agent = req.headers['user-agent'];
  res.render( 'tracking', {
    title : 'Tracking',
    id    : uuid(),
    agent : agent
  } );
} );

app.get( "/tracking/:id", function ( req, res ) {
  var agent = req.headers['user-agent'];
  res.render( 'tracking', {
    title : 'Tracking',
    id    : req.params.id,
    agent : agent
  } );
} );

app.get( "/conference", function ( req, res ) {
  var agent = req.headers['user-agent'];
  res.render( 'conference', {
    title : 'Conference',
    name  : uuid(),
    agent : agent
  } );
} );

app.get( "/conference/:name", function ( req, res ) {
  var agent = req.headers['user-agent'];
  res.render( 'conference', {
    title : 'Conference',
    name  : req.params.name,
    agent : agent
  } );
} );

app.get( "/angular", function ( req, res ) {
  var agent = req.headers['user-agent']
  res.render( 'angular', {
    title : 'Angular',
    agent : agent
  } );
} );

app.get( "/weather", function ( req, res ) {
  var agent = req.headers['user-agent']
  res.render( 'weather', {
    title : 'Weather',
    agent : agent
  } );
} );

app.get( "/svgtest", function ( req, res ) {
  var agent = req.headers['user-agent']
  res.render( 'svgtest', {
    title : 'SVG Test',
    agent : agent
  } );
} );

app.get( "/debug", function ( req, res ) {
  var agent = req.headers['user-agent']
  res.render( 'debug', {
    title : 'Debug',
    agent : agent
  } );
} );

var libs = {
  hyperglue       : {
    library : 'hyperglue',
    options : { expose : 'hyperglue' }
  },
  moment          : {
    library : 'moment',
    options : { expose : 'moment' }
  },
  moment_range    : {
    library : 'moment-range',
    options : { expose : 'moment.range' }
  },
  geometry        : {
    library : './lib/camstreet.geometry.js',
    options : { expose : 'geometry' }
  },
  merge           : {
    library : './lib/camstreet.merge.js',
    options : { expose : 'merge' }
  },
  template        : {
    library : './lib/camstreet.template.js',
    options : { expose : 'template' }
  },
  conference      : {
    library : './lib/camstreet.conference.js',
    options : { expose : 'conference' }
  },
  branding        : {
    library : './lib/camstreet.branding.js',
    options : { expose : 'branding' }
  },
  clustering      : {
    library : './lib/camstreet.clustering.js',
    options : { expose : 'clustering' }
  },
  notifications   : {
    library : './lib/camstreet.notifications.js',
    options : { expose : 'notifications' }
  },
  coverage        : {
    library : './lib/camstreet.coverage.js',
    options : { expose : 'coverage' }
  },
  time            : {
    library : './lib/camstreet.time.js',
    options : { expose : 'time' }
  },
  drawing         : {
    library : './lib/camstreet.drawing.js',
    options : { expose : 'features' }
  },
  markers         : {
    library : './lib/camstreet.markers.js',
    options : { expose : 'markers' }
  },
  geojson         : {
    library : './lib/camstreet.geojson.js',
    options : { expose : 'geojson' }
  },
  availability    : {
    library : './lib/camstreet.availability.js',
    options : { expose : 'availability' }
  },
  topojson        : {
    library : './lib/camstreet.topojson.js',
    options : { expose : 'topojson' }
  },
  markercluster   : {
    library : './lib/camstreet.markercluster.js',
    options : { expose : 'markercluster' }
  },
  handlebars      : {
    library : './lib/camstreet.handlebars.js',
    options : { expose : 'handlebars' }
  },
  project         : {
    library : './lib/camstreet.project.js',
    options : { expose : 'project' }
  },
  jsdap           : {
    library : './lib/camstreet.jsdap.js',
    options : { expose : 'jsdap' }
  },
  ol_thredds      : {
    library : './lib/camstreet.openlayers.thredds.js',
    options : { expose : 'ol.control.ThreddsControl' }
  },
  ol_time         : {
    library : './lib/camstreet.openlayers.time.js',
    options : { expose : 'ol.control.TimeControl' }
  },
  ol_layers       : {
    library : './lib/camstreet.openlayers.layers.js',
    options : { expose : 'ol.control.LayersControl' }
  },
  ol_inspect      : {
    library : './lib/camstreet.openlayers.inspect.js',
    options : { expose : 'ol.control.InspectControl' }
  },
  jquery          : {
    library : 'jquery-browserify',
    options : { expose : 'jquery' }
  },
  io              : {
    library : 'socket.io-browserify',
    options : { expose : 'socket.io' }
  },
  geohash         : {
    library : 'geohash',
    options : { expose : 'geohash' }
  },
  util            : {
    library : 'util',
    options : { expose : 'util' }
  },
  d3              : {
    library : 'd3',
    options : { expose : 'd3' }
  },
  traverse        : {
    library : 'traverse',
    options : { expose : 'traverse' }
  },
  http            : {
    library : 'http-browserify',
    options : { expose : 'http-browserify' }
  },
  underscore      : {
    library : 'underscore',
    options : { expose : 'underscore' }
  },
  angular         : {
    library : 'angular-browserify',
    options : { expose : 'angular' }
  },
  crossfilter     : {
    library : 'crossfilter',
    options : { expose : 'crossfilter' }
  },
  pip             : {
    library : 'leaflet-pip',
    options : { expose : 'pip' }
  },
  lodash          : {
    library : 'lodash',
    options : { expose : 'lodash' }
  },
  browser_request : {
    library : 'browser-request',
    options : { expose : 'browser-request' }
  },
  xml2js          : {
    library : 'xml2js',
    options : { expose : 'xml2js' }
  },
  q               : {
    library : 'q',
    options : { expose : 'q' }
  }
};

app.get( "/browserify", function ( req, res ) {
  var agent = req.headers['user-agent']
  res.render( 'browserify', {
    title : 'Browserify',
    libs  : libs,
    agent : agent
  } );
} );

app.get( "/browserify/load", function ( req, res ) {
  res.set( "Content-Type", "application/javascript" );
  _.inject( req.param( 'libs' ) ? req.param( 'libs' ).split( ',' ) : _.keys( libs ), function ( b, include ) {
    return libs[include].options ?
           b.require( libs[include].library, libs[include].options ) :
           b.require( libs[include].library )
  }, browser() )
    .transform( function ( file ) {
      var data = '';
      var write = function( buf ) {
        data += buf
      };
      var end = function() {
        //this.queue(coffee.compile(data));
        this.queue( data.toString() );
        this.queue( null );
      };
      if ( file.indexOf( 'node_modules' ) > 0 ) {
        return through( write, end );
      }
      else {
        return brfs( file );
      }
    } )
    .bundle( function ( err, src ) {
      if ( err ) {
        console.log( util.inspect( err ) );
      }
    } )
    .pipe( oppressor( req ) )
    .pipe( res )
} );

/*app.get( "/browserify/load/:lib", function ( req, res ) {
 res.set( "Content-Type", "application/javascript" );
 browser().require( libs[req.params.lib].library,
 libs[req.params.lib].options )
 .transform( 'brfs' )
 .bundle( function ( err, src ) {
 if ( err ) {
 console.log( util.inspect( err ) );
 }
 } )
 .pipe( oppressor( req ) )
 .pipe( res )
 } );*/

var cross = function ( req, res, next ) {
  res.header( 'Access-Control-Allow-Origin', '*' );
  res.header( 'Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS' );
  res.header( 'Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With' );
  if ( 'OPTIONS' == req.method ) {
    res.send( 200 );
  }
  else {
    next();
  }
};

app.use( cross );
app.use( errorhandler( { dumpExceptions : true, showStack : true } ) );
app.use( morgan( { format : 'dev', immediate : true } ) );
app.use( express.static( path.join( __dirname ) ) );
app.use( '/thredds', proxy( url.parse( 'http://localhost:8080/thredds' ) ) );

var server = http.createServer( app ).listen( app.get( 'port' ), "0.0.0.0", function () {
  console.log( "Express server listening on port " + app.get( 'port' ) );
} );

var io = require( 'socket.io' ).listen( server );

io.set( 'log level', 1 );
io.of( '/asset' ).on( 'connection', function ( socket ) {
  socket.on( 'identity', function ( data, func ) {
    debug( "identity", util.inspect( data ) );
    socket.set( 'identity', data, function () {
      func();
    } );
  } );
  socket.on( 'position', function ( data ) {
    debug( "position", util.inspect( data ) );
    socket.get( 'identity', function ( error, identity ) {
      socket.broadcast.emit( 'position', {
        identity : identity,
        position : data
      } );
    } )
  } );
} );

io.of( '/feature' ).on( 'connection', function ( socket ) {
  socket.on( 'created', function ( data, func ) {
    db.insert( data, function ( err, body, headers ) {
      if ( err ) {
        if ( err.message === 'no_db_file' ) {
          return nano.db.create( db_name, function () {
            //insert_doc( doc, tried + 1 );
            insert( doc, tried + 1 );
          } );
        }
        else {
          return console.log( err );
        }
      }
      data.properties.options.id = body.id
      data.id = body.id
      debug( "Feature Created", util.inspect( data, false, 4, true ) );
      socket.broadcast.emit( 'created', data );
      if ( func ) {
        func( body.id );
      }
    } );
  } );
  socket.on( 'edited', function ( data, func ) {
    debug( "Feature Edited", util.inspect( data ) );
    socket.broadcast.emit( 'edited', data );
    if ( func ) {
      func();
    }
  } );
  socket.on( 'deleted', function ( data, func ) {
    debug( "Feature Deleted", util.inspect( data ) );
    socket.broadcast.emit( 'deleted', data );
    if ( func ) {
      func();
    }
  } );
} );

io.of( '/view' ).on( 'connection', function ( socket ) {
  socket.on( 'update', function ( data ) {
    debug( "update", util.inspect( data ) );
    socket.broadcast.emit( 'update', data );
  } );
} );

io.of( '/availability' ).on( 'connection', function ( socket ) {
  socket.on( 'update', function ( data ) {
    debug( "update", util.inspect( data ) );
    socket.broadcast.emit( 'update', data );
  } );
} );

io.of( '/conference' ).on( 'connection', function ( socket ) {
  socket.emit( 'welcome', {
    motd : "Welcome to the conference " + uuid()
  } );
  socket.on( 'enter', function ( data ) {
    debug( "enter", util.inspect( data ) );
    data.id = socket.id
    socket.set( 'identity', data, function () {
      socket.get( 'identity', function ( err, data ) {
        socket.broadcast.emit( 'enter', data );
        _.each( socket.namespace.sockets, function ( other ) {
          other.get( 'identity', function ( err, data ) {
            socket.emit( 'enter', data );
          } );
        } );
      } );
    } );
  } );
  socket.on( 'offer', function ( data ) {
    debug( "offer", util.inspect( data ) );
    socket.namespace.sockets[data.id].emit( 'offer', {
      id      : socket.id,
      session : data.session
    } );
  } );
  socket.on( 'answer', function ( data ) {
    debug( "answer", util.inspect( data ) );
    socket.namespace.sockets[data.id].emit( 'answer', {
      id      : socket.id,
      session : data.session
    } );
  } );
  socket.on( 'candidate', function ( data ) {
    debug( "candidate", util.inspect( data ) );
    socket.namespace.sockets[data.id].emit( 'candidate', {
      id      : socket.id,
      payload : data.payload
    } );
  } );
  socket.on( 'disconnect', function () {
    debug( "disconnect", util.inspect( socket ) );
    socket.get( 'identity', function ( err, data ) {
      socket.broadcast.emit( 'exit', data );
    } );
  } );
} );

var replify = require( 'replify' );
console.log( 'Replify at: camstreet' );
replify( 'camstreet', app, {
  io     : io,
  emit   : function ( namespace, tag, data ) {
    debug( "emit", "Message to " + namespace + " for " + tag + " -> " + util.inspect( data ) );
    _.each( io.of( "/" + namespace ).sockets, function ( socket ) {
      socket.emit( tag, data );
    } );
  },
  listen : function ( namespace, tag, func ) {
    debug( "listen", "Listen to " + namespace + " for " + tag + " messages" );
    var socket = require( 'socket.io-client' ).connect( 'http://localhost:8080/' + namespace );
    socket.on( tag, function ( data ) {
      debug( tag, util.inspect( data ) );
      func( data );
    } );
    socket.on( 'disconnect', function () {
    } );
  }
} );

var error = function ( title, message ) {
  var fill = "========================================================";
  var line = "==========${title}==========";
  var date = new Date().toLocaleTimeString();

  var header = line.replace( "${title}", " " + title + " " + date + " " );
  var footer = line.replace( "${title}", fill.substring( 0, title.length + date.length + 3 ) );

  util.debug( header.red );
  util.debug( message.red )
  util.debug( footer.red );
};

var debug = function ( title, message ) {
  var fill = "========================================================";
  var line = "==========${title}==========";
  var date = new Date().toLocaleTimeString();

  var header = line.replace( "${title}", " " + title + " " + date + " " );
  var footer = line.replace( "${title}", fill.substring( 0, title.length + date.length + 3 ) );

  util.debug( header.blue );
  util.debug( message.blue )
  util.debug( footer.blue );
};
