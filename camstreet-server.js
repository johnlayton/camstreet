var connect   = require('connect')
  , express   = require('express')
  , fs        = require('fs')
  , ejs       = require('ejs')
  , util      = require('util')
  , browser   = require('browserify')
  , path      = require('path')
  , oppressor = require('oppressor')
  , http      = require('http');

var nano    = require('nano')('http://localhost:5984');
var db_name = "places";
var db      = nano.use(db_name);

//http://localhost:5984/places/_design/main/_spatial/points?bbox=143,-45,160,-35
nano.db.create(db_name, function () {
  db.insert(
    { "spatial":
      {
        "points": function(doc) {
          if (doc.geometry.coordinates) {
            emit( { type: "Point",
                    coordinates: [doc.geometry.coordinates[0], doc.geometry.coordinates[1]]
                  }, [doc._id, doc.geometry]
            );
          }
        }
      }
    },
    '_design/main',
    function (err, res) {
      if ( err ) {
        util.debug( '** FAILURE **' );
        util.debug( util.inspect( err ) );
      } else {
        util.debug( '** SUCCESS **' );
        util.debug( util.inspect( res ) );
      }
    }
  );
});

var b = browser()
b.require('underscore')
b.require('util')
b.require('d3')
b.require('traverse')
b.require('geohash')
b.require('http-browserify')
b.require('socket.io-browserify',             { expose: 'socket.io' })
b.require('jquery-browserify',                { expose: 'jquery' })
b.require('./lib/camstreet.geojson.js',       { expose: 'geojson' })
b.require('./lib/camstreet.features.js',      { expose: 'features' })
b.require('./lib/camstreet.time.js',          { expose: 'time' })
b.require('./lib/camstreet.coverage.js',      { expose: 'coverage' })
b.require('./lib/camstreet.notifications.js', { expose: 'notifications' })

var app = express();

var cross = function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
  if ('OPTIONS' == req.method) {
    res.send(200);
  }
  else {
    next();
  }
};

app.configure(function(){
  app.set('port', process.env.PORT || 8080);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(cross);
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(require('less-middleware')({
     src:   path.join( __dirname, '/less' )
   , dest:  path.join( __dirname, '/public' )
  }));
  /*
  app.use(sass.middleware({
      src:   path.join( __dirname, '/sass' )
    , dest:  path.join( __dirname, '/public' )
    , debug: true
  }));
  */
  app.use(connect.static(path.join(__dirname)));
  /*
  app.use(express.static(path.join(__dirname, 'public')));
  */
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.get("/", function(req,res){
  var agent = req.headers['user-agent'];
  res.render('index', {
    title : 'Welcome',
    agent : agent
  });
});

app.get("/coverage", function(req,res) {
  var agent = req.headers['user-agent'];
  res.render('coverage', {
    title : 'Coverage Demo',
    agent : agent
  });
})

app.get("/wax", function(req,res) {
  var agent = req.headers['user-agent']
  res.render('wax', {
    title : 'Wax Demo',
    agent : agent
  });
})

app.get("/google", function(req,res) {
  var agent = req.headers['user-agent']
  res.render('google', {
    title : 'Google Demo',
    agent : agent
  });
})

app.get("/notification", function(req,res) {
  var agent = req.headers['user-agent']
  res.render('google', {
    title : 'Google Demo',
    agent : agent
  });
})

app.get("/browserify.js", function(req,res) {
  res.set( "Content-Type", "application/javascript" );
  b.bundle(function(err,src){} ).pipe(oppressor(req)).pipe(res);
});

app.get("/tracking/:id", function(req,res) {
  var agent = req.headers['user-agent'];
  res.render('tracking', {
    title : 'Tracking',
    id    : req.params.id,
    agent : agent
  });
})

app.get("/conference/:id", function(req,res) {
  var agent = req.headers['user-agent'];
  res.render('conference', {
    title : 'Conferenceß',
    id    : req.params.id,
    agent : agent
  });
})

/*
app.get("/leaflet/:id", function(req,res) {
  var agent = req.headers['user-agent']
  res.render('leaflet', {
    title : 'Drawing',
    id    : req.params.id,
    agent : agent
  });
})
 */

app.get("/room/:room", function(req,res) {
  var agent = req.headers['user-agent']
  res.render('room', {
    title : 'Room ' + req.params.room,
    room  : req.params.room,
    agent : agent
  });
})

app.get("/basic", function(req,res) {
  res.render('basic', {
    title : 'Basic Demo'
  });
})

var server = http.createServer(app).listen(app.get('port'), "0.0.0.0", function(){
  console.log("Express server listening on port " + app.get('port'));
});

var io = require('socket.io').listen(server);

io.set('log level', 1);
io.of('/asset').on('connection', function(socket){
  socket.on('identity', function (data, func) {
    socket.set( 'identity', data, function () {
      func();
    });
  });
  socket.on('position', function( position ) {
    socket.get( 'identity', function(error, identity){
      socket.broadcast.emit('position', {
        identity: identity,
        position: position
      });
    })
  });
});

io.of('/feature' ).on('connection', function( socket ) {
  socket.on('created', function( data, func ) {
    db.insert(data, function (err, body, headers) {
      if(err) {
        if(err.message === 'no_db_file') {
          return nano.db.create(db_name, function () {
            insert_doc(doc, tried+1);
          });
        }
        else { return console.log(err); }
        util.debug( util.inspect( err ) );
      }
      data.properties.options.id = body.id
      data.id = body.id
      socket.broadcast.emit( 'created', data);
      if ( func ) { func( body.id ); }
    });
  });
  socket.on('edited', function( data, func ) {
    socket.broadcast.emit( 'edited', data);
    if ( func ) { func(); }
  });
  socket.on('deleted', function( data, func ) {
    socket.broadcast.emit( 'deleted', data);
    if ( func ) { func(); }
  });
});

io.of('/view' ).on('connection', function(socket){
  socket.on('update', function(data) {
    socket.broadcast.emit('update', data);
  });
});

/**
 * TODO: not working as signal server for webrtc client
 */
var conference = io.of('/conference').on('connection', function (client) {
  // pass a message
  client.on('message', function (details) {
    var otherClient = io.sockets.sockets[details.to];
    if (!otherClient) {
      return;
    }
    delete details.to;
    details.from = client.id;
    otherClient.emit('message', details);
  });

  client.on('join', function (name) {
    client.join(name);
    conference.emit('joined', {
      room: name,
      id: client.id
    });
  });

  function leave() {
    var rooms = io.sockets.manager.roomClients[client.id];
    for (var name in rooms) {
      if (name) {
        //io.sockets.in(name.slice(1)).emit('left', {
        conference.emit('left', {
          room: name,
          id: client.id
        });
      }
    }
  }

  client.on('disconnect', leave);
  client.on('leave', leave);

  client.on('create', function (name, cb) {
    if (arguments.length == 2) {
      cb = (typeof cb == 'function') ? cb : function () {};
      name = name || uuid();
    } else {
      cb = name;
      name = uuid();
    }
    // check if exists
    if (io.sockets.clients(name).length) {
      cb('taken');
    } else {
      client.join(name);
      if (cb) cb(null, name);
    }
  });
});
