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

  ol.control.TimeControl = function ( opt_options ) {

    var options = opt_options || {};

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

    var element = document.createElement( 'div' );
    element.className = 'time-slider ol-unselectable';
    element.appendChild( slider );
    element.appendChild( label );

    ol.control.Control.call( this, {
      element : element,
      target  : options.target
    } );

  };

  ol.inherits( ol.control.TimeControl, ol.control.Control );

} ));