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

  L.Control.Notification = L.Control.extend( {
    options: {
      position: 'bottomleft',
      title: 'Allow Notifications'
    },

    initialize: function ( options ) {
      L.setOptions( this, options );
    },

    onAdd: function ( map ) {
      var notificationsName = 'leaflet-control-notifications',
          container = L.DomUtil.create( 'div', notificationsName + ' leaflet-bar' );

      this._map = map;
      this._enabled = ( window.webkitNotifications.checkPermission() != 0 );

      var notifications = this;

      map.notification = function ( title, message, displayed, closed ) {
        displayed = displayed ? displayed : function(){};
        closed    = closed    ? closed    : function(){};
        if ( notifications._enabled ) {
          notify = window.webkitNotifications.createNotification( 'icon.png', title, message );
          notify.ondisplay = displayed;
          notify.onclose = closed;
          notify.show();
        }
      };

      this._label =
      this._createLabel( notificationsName + '-label', container, this );

      this._slider =
      this._createInput( notificationsName + '-input', container, this._updateNotifications, this );

      return container;
    },

    _createLabel: function ( className, container, context ) {
      var label = L.DomUtil.create( 'div', className, container );
      label.innerHTML = this.options.title;
      return label;
    },

    _createInput: function ( className, container, fn, context ) {
      var input = L.DomUtil.create( 'input', className, container );
      input.type = 'checkbox';
      input.checked = this.enabled ? "checked" : "";

      var stop = L.DomEvent.stopPropagation;

      L.DomEvent
        .on( input, 'click', stop )
        .on( input, 'mousedown', stop )
        .on( input, 'dblclick', stop )
        .on( input, 'change', L.DomEvent.preventDefault )
        .on( input, 'change', fn, context );

      return input;
    },

    _updateNotifications: function ( e ) {
      if ( e.target.checked ) {
        if ( window.webkitNotifications.checkPermission() == 0 ) {
          notification_test =
          window.webkitNotifications.createNotification( 'icon.png', 'Notification Title', 'Notification content...' );
          notification_test.show();
        }
        else {
          window.webkitNotifications.requestPermission();
        }
        this._enabled = true;
      }
      else {
        this._enabled = false;
      }
    }
  } );

  L.Map.mergeOptions( {
    notificationControl: true
  } );

  L.Map.addInitHook( function () {
    if ( this.options.notificationControl ) {
      this.notificationControl = (new L.Control.Notification()).addTo( this );
    }
  } );

  L.control.notification = function ( options ) {
    return new L.Control.Notification( options );
  };

} ));