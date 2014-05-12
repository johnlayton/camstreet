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

  var request = require( 'browser-request' );
  var xml2js = require( 'xml2js' );
  var util = require( 'util' );
  var q = require( 'q' );
  var _ = require( 'lodash' );

  ol.control.ThreddsControl = function ( opt_options ) {

    var options = opt_options || {};

    var host = options.host || 'http://localhost:3000';
    var indx = options.indx || '/thredds/catalog.xml';

    var a = function ( url ) {
      var deferred = q.defer();
      request( url, function ( err, res, body ) {
        if ( err ) {
          deferred.reject( err );
        }
        else {
          new xml2js.Parser().parseString( body, function ( err, data ) {
            if ( err ) {
              deferred.reject( err );
            }
            else {
              var catalog = data.catalog;
              if ( data.catalog.catalogRef ) {
                q.allSettled( _.map( data.catalog.catalogRef, function( ref ) {
                  return a( host + ref['$']['xlink:href'] );
                } ) ).then( function( results ) {
                  catalog.catalogs = _.map( results, function( result ) { return result.value; } );
                  deferred.resolve( catalog );
                } );
              }
              else {
                deferred.resolve( catalog );
              }
            }
          } )
        }
      } );
      return deferred.promise;
    };

    q( a( host + indx ) ).then( function ( catalog ) {
      console.log( catalog );
    } );

    /*
     var this_ = this;

     var label = document.createElement( 'div' );

     var slider = document.createElement( 'input' );
     slider.type = 'range';
     slider.step = 1;
     slider.height = 50;
     slider.width = 150;
     slider.step = 60 * 60 * 1000;
     slider.value = options.min.getTime();
     slider.min = options.min.getTime();
     slider.max = options.max.getTime();

     slider.addEventListener( "change", function ( e ) {
     label.innerHTML = moment( new Date( parseInt( e.target.value ) ) ).format( "HH:mm:ss DD/MM/YYYY" );
     this_.getMap().getLayers().forEach( function ( layer ) {
     if ( layer.getSource && layer.getSource().getParams && layer.getSource().getParams()['time'] ) {
     var time = moment( new Date( parseInt( e.target.value ) ) ).format( "YYYY-MM-DDTHH:mm:ss.SSS" );
     if ( layer.getVisible() ) {
     layer.getSource().updateParams( { time : time } );
     }
     else {
     layer.getSource().getParams()['time'] = time;
     }
     }
     } )
     }.bind( this ) );
     label.innerHTML = moment( new Date( parseInt( slider.value ) ) ).format( "HH:mm:ss DD/MM/YYYY" );
     */

    var element = document.createElement( 'div' );
    element.className = 'thredds ol-unselectable';
    //element.appendChild( slider );
    //element.appendChild( label );

    ol.control.Control.call( this, {
      element : element,
      target  : options.target
    } );

  };

  ol.inherits( ol.control.ThreddsControl, ol.control.Control );

} ))
;