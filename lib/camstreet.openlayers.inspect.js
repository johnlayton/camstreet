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

  var jsdap = require( './camstreet.jsdap.js' );

  ol.control.InspectControl = function ( opt_options ) {

    var options = opt_options || {};

    if ( goog.isDef( options.projection ) ) {
      this.setProjection( ol.proj.get( options.projection ) )
    }

    this.transform_ = null;
    this.mapProjection_ = null;

    this.margin = margin = options.margin || {top : 20, right : 20, bottom : 30, left : 50},
      this.width = width = ( options.width || 600 ) - margin.left - margin.right,
      this.height = height = ( options.height || 300 ) - margin.top - margin.bottom;

    this.inspect = inspect = goog.dom.createDom( goog.dom.TagName.DIV, ["inspect", ol.css.CLASS_SELECTABLE] );

    // Set up svg using d3;
    this.svg = svg = d3.select( this.inspect ).append( "svg" )
      .attr( "width", width + margin.left + margin.right )
      .attr( "height", height + margin.top + margin.bottom )
      .append( "g" )
      .attr( "transform", "translate(" + margin.left + "," + margin.top + ")" );

    var element = document.createElement( 'div' );
    element.className = 'inspect ol-unselectable';
    element.appendChild( inspect );

    ol.control.Control.call( this, {
      element : element,
      target  : options.target
    } );
  };

  ol.inherits( ol.control.InspectControl, ol.control.Control );

  ol.control.InspectControl.prototype.getProjection = function () {
    return(this.projection);
  };

  ol.control.InspectControl.prototype.setProjection = function ( projection ) {
    this.projection = projection;
  };

  ol.control.InspectControl.prototype.setMap = function ( map ) {
    goog.base( this, "setMap", map );
    if ( !goog.isNull( map ) ) {
      map.render();
      map.getLayers().forEach( function ( layer ) {
        if ( layer.get( 'dods' ) ) {
          var url = layer.get( 'dods' )['url'];
          $.ajax( {
            url        : url + '?time,latitude,longitude',
            //dataType   : 'text',
            beforeSend : function ( xhr ) {
              xhr.overrideMimeType( "text/plain; charset=x-user-defined" );
            }
          } ).then( function ( data ) {
            layer.get( 'dods' ).dimensions = jsdap( data );
          } );

          layer.get( 'dods' ).getData = function ( x, y ) {
            //var t1 = _.findLastIndex( buf[1][2], function( i ) { return i < ( t.toDate().getTime() / 1000 ) } );
            //var t2 = t1 + 1;
            var dods = this.get( 'dods' ).dimensions;
            var t1 = 0;
            var t2 = dods[0].time.shape[0] - 1;
            var x1 = _.findLastIndex( dods[1][1], function ( i ) {
              return i < x
            } );
            var x2 = x1 + 1;
            var y1 = _.findLastIndex( dods[1][0], function ( i ) {
              return i < y
            } );
            var y2 = y1 + 1;
            return $.ajax( {
              url        : url + "?" + layer.get( 'dods' ).layer + "[" + t1 + ":1:" + t2 + "][" + y2 + ":1:" + y2 + "][" + x2 + ":1:" + x2 + "]",
              dataType   : 'text',
              beforeSend : function ( xhr ) {
                xhr.overrideMimeType( "text/plain; charset=x-user-defined" );
              }
            } ).then( function ( data ) {
              return jsdap( data );
            } );
          }.bind( layer );
        }
      } );
      var viewport = map.getViewport();
      this.listenerKeys.push(
        goog.events.listen( viewport, goog.events.EventType.MOUSEMOVE, this.handleMouseMove, false, this )
        //, goog.events.listen( viewport, goog.events.EventType.MOUSEOUT, this.handleMouseOut, false, this )
      );
    }
  };

  ol.control.InspectControl.prototype.handleMapPostrender = function ( mapEvent ) {
    var frameState = mapEvent.frameState;
    if ( goog.isNull( frameState ) ) {
      this.mapProjection_ = null
    }
    else {
      if ( this.mapProjection_ != frameState.view2DState.projection ) {
        this.mapProjection_ = frameState.view2DState.projection;
        this.transform_ = null
      }
    }
    //this.updateHTML_( this.lastMouseMovePixel_ )
  };

  ol.control.InspectControl.prototype.handleMouseMove = _.debounce( function ( browserEvent ) {
    var map = this.getMap();
    var position = goog.style.getRelativePosition( browserEvent, map.getViewport() );
    map.getLayers().forEach( function ( layer ) {
      if ( layer.getVisible() ) {
        this.updateChart( layer, [position.x, position.y] );
      }
    }.bind( this ) );
  }, 200 );

  ol.control.InspectControl.prototype.updateChart = function ( layer, position ) {

    if ( !goog.isNull( position ) && !goog.isNull( this.mapProjection_ ) ) {
      if ( goog.isNull( this.transform_ ) ) {
        var projection = this.getProjection();
        if ( goog.isDef( projection ) ) {
          this.transform_ = ol.proj.getTransformFromProjections( this.mapProjection_, projection )
        }
        else {
          this.transform_ = ol.proj.identityTransform
        }
      }
      var map = this.getMap();
      var coordinate = map.getCoordinateFromPixel( position );
      if ( !goog.isNull( coordinate ) ) {
        this.transform_( coordinate, coordinate );

        //var coordinateFormat = this.getCoordinateFormat();
        //if ( goog.isDef( coordinateFormat ) ) {
        //  console.log( coordinateFormat( coordinate ) );
        //}
        //else {
        //  console.log( coordinate.toString() );
        //}

        if ( layer.get( 'dods' ) && layer.get( 'dods' ).getData ) {
          //layer.getData( moment( layer.getSource().getParams()['time'] ), coordinate[0], coordinate[1] );
          layer.get( 'dods' ).getData( coordinate[0], coordinate[1] ).then( function ( data ) {
            var dods = data[1][0];
            var values = _.map( dods[0], function ( arr ) {
              return arr[0][0];
            } );
            var dates = _.map( dods[1], function ( val ) {
              return moment( val * 1000 ).toDate();
            } );
            var d = _.filter( _.map( _.zip( dates, values ), function ( arr ) {
              return { date : arr[0], value : arr[1] }
            } ), function ( a ) {
              return parseInt( a.value ) > -32760;
            } );
            var width = this.width;
            var height = this.height;

            var x = d3.time.scale()
              .range( [0, width] );

            var y = d3.scale.linear()
              .range( [height, 0] );

            var xAxis = d3.svg.axis()
              .scale( x )
              .orient( "bottom" );

            var yAxis = d3.svg.axis()
              .scale( y )
              .orient( "left" );

            var line = d3.svg.line()
              .x( function ( d ) { /*debugger;*/
                return x( d.date );
              } )
              .y( function ( d ) { /*debugger;*/
                return y( d.value );
              } );

            x.domain( d3.extent( d, function ( d ) {
              return d.date;
            } ) );
            y.domain( d3.extent( d, function ( d ) {
              return d.value;
            } ) );

            var svg = this.svg;

            svg.selectAll( "g" ).remove();
            svg.append( "g" )
              .attr( "class", "x axis" )
              .attr( "transform", "translate(0," + height + ")" )
              .call( xAxis );

            svg.append( "g" )
              .attr( "class", "y axis" )
              .call( yAxis )
              .append( "text" )
              .attr( "transform", "rotate(-90)" )
              .attr( "y", 6 )
              .attr( "dy", ".71em" )
              .style( "text-anchor", "end" );

            svg.select( "path" ).remove();
            svg.append( "path" )
              .datum( d )
              .attr( "class", "line" )
              .attr( "d", line );

          }.bind( this ) );
        }
      }
    }
  };

} ));