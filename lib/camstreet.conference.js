(function ( root, factory ) {
  if ( typeof exports === 'object' ) {
    module.exports = factory();
  }
  else if ( typeof define === 'function' && define.amd ) {
    define( [], factory );
  }
  else {
    root.returnExports = factory();
  }
}( this, function () {

  var RTCPeerConnection = null,
    getUserMedia = null,
    attachMediaStream = null,
    browser = null,
    webrtc = true;

  if ( navigator.mozGetUserMedia ) {
    browser = "firefox";

    RTCPeerConnection = mozRTCPeerConnection;
    RTCSessionDescription = mozRTCSessionDescription;
    RTCIceCandidate = mozRTCIceCandidate;

    getUserMedia = navigator.mozGetUserMedia.bind( navigator );

    attachMediaStream = function ( element, stream ) {
      element.mozSrcObject = stream;
      element.play();
    };

    MediaStream.prototype.getVideoTracks = function () {
      return [];
    };

    MediaStream.prototype.getAudioTracks = function () {
      return [];
    };
  }
  else if ( navigator.webkitGetUserMedia ) {
    browser = "chrome";

    RTCPeerConnection = webkitRTCPeerConnection;

    getUserMedia = navigator.webkitGetUserMedia.bind( navigator );

    attachMediaStream = function ( element, stream ) {
      element.autoplay = true;
      element.src = webkitURL.createObjectURL( stream );
    };

    if ( !webkitMediaStream.prototype.getVideoTracks ) {
      webkitMediaStream.prototype.getVideoTracks = function () {
        return this.videoTracks;
      };
      webkitMediaStream.prototype.getAudioTracks = function () {
        return this.audioTracks;
      };
    }

    if ( !webkitRTCPeerConnection.prototype.getLocalStreams ) {
      webkitRTCPeerConnection.prototype.getLocalStreams = function () {
        return this.localStreams;
      };
      webkitRTCPeerConnection.prototype.getRemoteStreams = function () {
        return this.remoteStreams;
      };
    }
  }
  else {
    webrtc = false;
  }

  function WildEmitter() {
    this.callbacks = {};
  }

  WildEmitter.prototype.on = function ( event, groupName, fn ) {
    var hasGroup = (arguments.length === 3),
      group = hasGroup ? arguments[1] : undefined,
      func = hasGroup ? arguments[2] : arguments[1];
    func._groupName = group;
    (this.callbacks[event] = this.callbacks[event] || []).push( func );
    return this;
  };

  WildEmitter.prototype.once = function ( event, fn ) {
    var self = this;

    function on() {
      self.off( event, on );
      fn.apply( this, arguments );
    }

    this.on( event, on );
    return this;
  };

  WildEmitter.prototype.releaseGroup = function ( groupName ) {
    var item, i, len, handlers;
    for ( item in this.callbacks ) {
      handlers = this.callbacks[item];
      for ( i = 0, len = handlers.length; i < len; i++ ) {
        if ( handlers[i]._groupName === groupName ) {
          handlers.splice( i, 1 );
          i--;
          len--;
        }
      }
    }
    return this;
  };

  WildEmitter.prototype.off = function ( event, fn ) {
    var callbacks = this.callbacks[event],
      i;

    if ( !callbacks ) {
      return this;
    }

    if ( arguments.length === 1 ) {
      delete this.callbacks[event];
      return this;
    }

    i = callbacks.indexOf( fn );
    callbacks.splice( i, 1 );
    return this;
  };

  WildEmitter.prototype.emit = function ( event ) {
    var args = [].slice.call( arguments, 1 ),
      callbacks = this.callbacks[event],
      specialCallbacks = this.getWildcardCallbacks( event ),
      i,
      len,
      item;

    if ( callbacks ) {
      for ( i = 0, len = callbacks.length; i < len; ++i ) {
        callbacks[i].apply( this, args );
      }
    }

    if ( specialCallbacks ) {
      for ( i = 0, len = specialCallbacks.length; i < len; ++i ) {
        specialCallbacks[i].apply( this, [event].concat( args ) );
      }
    }

    return this;
  };

  WildEmitter.prototype.getWildcardCallbacks = function ( eventName ) {
    var item,
      split,
      result = [];

    for ( item in this.callbacks ) {
      split = item.split( '*' );
      if ( item === '*' || (split.length === 2 && eventName.slice( 0, split[1].length ) === split[1]) ) {
        result = result.concat( this.callbacks[item] );
      }
    }
    return result;
  };

  var Conference = function ( host, opts ) {
    var self = this;

    var socket = this.socket = i.connect( host, opts );

    console.log( webrtc ? "WebRTC enabled for " + browser : "WebRTC not enabled" );
    console.log( socket ? "Signal server available at " + host : "Signal server not available" );

    iceServers = {
      'firefox': [
        {"url": "stun:124.124.124.2"}
      ],
      'chrome': [
        {"url": "stun:stun.l.google.com:19302"}
      ]
    }

    var config = this.config = {
      autoRequestMedia: false,
      localVideoEl: opts.localVideoEl ? opts.localVideoEl : '',
      remoteVideosEl: opts.remoteVideosEl ? opts.remoteVideosEl : '',
      peerConnectionConfig: {
        iceServers: iceServers[browser]
      },
      peerConnectionConstraints: {
        optional: [
          {"DtlsSrtpKeyAgreement": true}
        ]
      },
      media: {
        audio: true,
        video: {
          mandatory: {},
          optional: []
        }
      }
    };

    this.peers = {};

    socket.on( "connect", function () {
      self.start();
    } );

    socket.on( "welcome", function ( data ) {
      self.emit( "welcome", data );
    } );

    socket.on( "enter", function ( data ) {
      self.emit( "enter", data );
    } );

    socket.on( "offer", function ( data ) {
      self.emit( "offer", data );
      self.conversation( data ).offer( data );
    } );

    socket.on( "answer", function ( data ) {
      self.emit( "answer", data );
      self.conversation( data ).answer( data );
    } );

    socket.on( "candidate", function ( data ) {
      self.emit( "candidate", data );
      self.conversation( data ).candidate( data );
    } );

    socket.on( "exit", function ( data ) {
      self.emit( "exit", data );
    } );

    WildEmitter.call( this );

    this.on( '*', function () {
      console.log( 'Event:', u.inspect( arguments ) );
    } );

    //if (this.config.autoRequestMedia)
    //this.startLocalVideo();
  };

  Conference.prototype = Object.create( WildEmitter.prototype, {
    constructor: {
      value: Conference
    }
  } );


  Conference.prototype.getEl = function ( idOrEl ) {
    if ( typeof idOrEl == 'string' ) {
      return document.getElementById( idOrEl );
    }
    else {
      return idOrEl;
    }
  };
  /*

   Conference.prototype.getLocalVideoContainer = function () {
   var el = this.getEl( this.config.local );
   if ( el && el.tagName === 'VIDEO' ) {
   return el;
   }
   else {
   var video = document.createElement( 'video' );
   el.appendChild( video );
   return video;
   }
   };

   Conference.prototype.getRemoteVideoContainer = function () {
   return this.getEl( this.config.remoteVideosEl );
   };
   */


  Conference.prototype.getRemoteVideoContainer = function () {
    return this.getEl( this.config.remoteVideosEl );
  };


  Conference.prototype.conversation = function ( data ) {
    var self = this;
    var existing = self.peers[data.id];
    if ( existing ) {
      return existing;
    }
    else {
      self.peers[data.id] = new Conversation( {
        id: data.id,
        parent: self,
        initiator: false
      } );
      return self.peers[data.id];
    }
  };

  Conference.prototype.start = function () {
    var self = this;
    getUserMedia( this.config.media, function ( stream ) {
      //attachMediaStream( element || self.getLocalVideoContainer(), stream );
      self.sessionReady = true;
      self.localStream = stream;
      self.ready();
    }, function () {
      throw new Error( 'Failed to get access to local media.' );
    } );
  };

  Conference.prototype.ready = function () {
    var self = this;
    if ( this.localStream && this.sessionReady ) {
      setTimeout( function () {
        self.emit( 'ready', self.socket.sessionid );
      }, 1000 );
    }
  };

  Conference.prototype.enter = function ( name ) {
    this.socket.emit( "enter", { name: name } );
  };

  Conference.prototype.call = function ( data ) {
    var self = this;
    this.peers[data.id] = new Conversation( {
      id: data.id,
      parent: self,
      initiator: true
    } );
    this.peers[data.id].start();
  };

  function Conversation( options ) {
    var self = this;

    this.id = options.id;
    this.parent = options.parent;
    this.initiator = options.initiator;

    this.pc = new RTCPeerConnection(
      this.parent.config.peerConnectionConfig,
      this.parent.config.peerConnectionContraints
    );
    this.pc.onicecandidate = this.onIceCandidate.bind( this );
    this.pc.addStream( this.parent.localStream );
    this.pc.onaddstream = this.handleRemoteStreamAdded.bind( this );
    this.pc.onremovestream = this.handleStreamRemoved.bind( this );

    this.mediaConstraints = {
      'mandatory': {
        'OfferToReceiveAudio': true,
        'OfferToReceiveVideo': true
      }
    };

    WildEmitter.call( this );

    this.on( '*', function ( name, value ) {
      self.parent.emit( name, value, self );
    } );
  };


  Conversation.prototype = Object.create( WildEmitter.prototype, {
    constructor: {
      value: Conversation
    }
  } );

  Conversation.prototype.onIceCandidate = function ( event ) {
    var self = this;
    if ( this.closed ) {
      return;
    }
    if ( event.candidate ) {
      self.parent.socket.emit( 'candidate',
        {
          id: self.id,
          payload: {
            id: event.candidate.sdpMid,
            label: event.candidate.sdpMLineIndex,
            candidate: event.candidate.candidate
          }
        }
      );
    }
    else {
      console.log( "End of candidates." );
    }
  };
  Conversation.prototype.start = function () {
    var self = this;
    this.pc.createOffer( function ( session ) {
      self.pc.setLocalDescription( session );
      self.parent.socket.emit( 'offer', { id: self.id, session: session } );
    }, null, this.mediaConstraints );
  };

  Conversation.prototype.end = function () {
    this.pc.close();
    this.handleStreamRemoved();
  };

  Conversation.prototype.offer = function ( data ) {

    console.log( "=========== offer =============" );
    console.log( u.inspect( data ) );
    console.log( "===============================" );

    var self = this;
    this.pc.setRemoteDescription( new RTCSessionDescription( data.session ) );
    this.pc.createAnswer( function ( session ) {
      self.pc.setLocalDescription( session );
      self.parent.socket.emit( 'answer', { id: self.id, session: session } );
    }, function ( err ) {
      console.log( u.inspect( err ) );
    }, this.mediaConstraints );
  };

  Conversation.prototype.answer = function ( data ) {

    console.log( "=========== answer =============" );
    console.log( u.inspect( data ) );
    console.log( "===============================" );

    this.pc.setRemoteDescription( new RTCSessionDescription( data.session ) );
  };

  Conversation.prototype.candidate = function ( data ) {
    console.log( "=========== candidate =========" );
    console.log( u.inspect( data ) );
    console.log( "===============================" );
    var candidate = new RTCIceCandidate( {
      sdpMLineIndex: data.payload.label,
      candidate: data.payload.candidate
    } );
    this.pc.addIceCandidate( candidate );
  };

  Conversation.prototype.handleRemoteStreamAdded = function ( event ) {
    var stream = this.stream = event.stream,
      el = document.createElement( 'video' ),
      container = this.parent.getRemoteVideoContainer();
    el.id = this.id;
    attachMediaStream( el, stream );
    if ( container ) {
      container.appendChild( el );
    }
    this.emit( 'videoAdded', el );
  };

  Conversation.prototype.handleStreamRemoved = function () {
    var video = document.getElementById( this.id ),
      container = this.parent.getRemoteVideoContainer();
    if ( video && container ) {
      container.removeChild( video );
    }
    this.emit( 'videoRemoved', video );
    delete this.parent.pcs[this.id];
    this.closed = true;
  };

  return Conference;

} ));