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

  var cf = require( 'crossfilter' );
  var un = require( 'underscore' );
  var ut = require( 'util' );
  var hg = require( 'hyperglue' );
  var fs = require( 'fs' );

  var extract = function ( district, data, types, agencies ) {
    var equalTo = equalTo || function ( a ) {
      return function ( b ) {
        return un.isEqual( a, b );
      }
    };

    var type = function ( d ) {
      if ( _.find( types || [ "Person" ], equalTo( d.type ) ) ) {
        return d.type;
      }
      return "Other";
    }

    var agency = function ( d ) {
      if ( _.find( agencies || [ "DSE", "DPI", "CFA" ], equalTo( d.agency ) ) ) {
        return d.agency;
      }
      return "Other";
    }

    var add = function ( p, v ) {
      return p.concat( v.properties.availability );
    }

    var inc = function ( p, v ) {
      return {
        'type': type( v ),
        'agency': agency( v ),
        'total': v.total + p.total,
        'available': v.available + p.available
      };
    }

    var rem = function ( p, v ) {
      return {};
    }

    var arr = function () {
      return [];
    }

    var obj = function () {
      return {
        total: 0,
        available: 0
      };
    }

    var features = cf( data.features );
    var dimension = features.dimension( function ( feature ) {
      return feature.properties.location.district;
    } );

    dimension.filter( district );

    var props = cf( features.groupAll().reduce( add, rem, arr ).value() );
    var dim = props.dimension( function ( p ) {
      return type( p ) + " " + agency( p );
    } );
    return dim.group().reduce( inc, rem, obj ).top( Infinity );
  }

  return {
    availability: function ( props, available, types, agencies ) {
      var label = function ( props ) {
        return props['REGION_NAM'].toLocaleLowerCase() + ' - ' + props['DISTRICT_N'].toLocaleLowerCase();
      }
      var html = fs.readFileSync( __dirname + "/../html/_availability.html" );
      var data = extract( props['DISTRICT_N'] + " FIRE DISTRICT", available, types, agencies );
      var arr = un.map( data, function ( item ) {
        return {
          '.type': item.value.type,
          '.agency': item.value.agency,
          '.total': item.value.total,
          '.available': item.value.available
        };
      } );
      return props ? hg( html, {
        '.label': label( props ),
        '.row': arr
      } ).outerHTML : 'Hover over a state';
    },

    properties: function ( type, data ) {
      var title = function ( type ) {
        return type;
      }

      var html = fs.readFileSync( __dirname + "/../html/_properties.html" );
      var arr = un.map( data, function( value, key ) {  return {
        '.type': key,
        '.definition': value
      }} );
      return data ? hg( html, {
        '.title': title( type ),
        '.item': arr
      } ).outerHTML : 'Missing Properties';
    }
  };

} ));