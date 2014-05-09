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

  ol.control.LayersControl = function ( opt_options ) {

    var options = opt_options || {};

    this.layers = layers = goog.dom.createDom( goog.dom.TagName.UL, ["layers-list", ol.css.CLASS_SELECTABLE] );

    var element = document.createElement( 'div' );
    element.className = 'layers ol-unselectable';
    element.appendChild( layers );

    ol.control.Control.call( this, {
      element : element,
      target  : options.target
    } );
  };

  ol.inherits( ol.control.LayersControl, ol.control.Control );

  ol.control.LayersControl.prototype.setMap = function ( map ) {
    goog.base( this, "setMap", map );
    if ( !goog.isNull( map ) ) {
      map.render();
      map.getLayers().forEach( function ( layer ) {
        var cb = goog.dom.createDom( goog.dom.TagName.INPUT, ["", ol.css.CLASS_UNSELECTABLE] );
        cb.type = "checkbox";

        var lb = goog.dom.createDom( goog.dom.TagName.LABEL, ["", ol.css.CLASS_UNSELECTABLE], cb, layer.get( 'title' ) );
        //lb.innerHTML = layer.get( 'title' );

        //var fs = goog.dom.createDom( goog.dom.TagName.FIELDSET, ["", ol.css.CLASS_UNSELECTABLE], lb );
        //
        //var sp = goog.dom.createDom( goog.dom.TagName.SPAN, ["", ol.css.CLASS_UNSELECTABLE] );
        //sp.innerHTML = layer.get( 'title' );

        var li = goog.dom.createDom( goog.dom.TagName.LI, ["", ol.css.CLASS_UNSELECTABLE], lb );


        new ol.dom.Input( cb ).bindTo( 'checked', layer, 'visible' );

        this.layers.appendChild( li );

      }.bind( this ) );
    }
  };

} ));