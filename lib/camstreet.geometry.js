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

  return function ( config ) {

    L.MultiPolyline.include( {
      getCenter: function () {
        return new L.LatLng( 0, 0 );
      }
    } );

    L.MultiPolygon.include( {
      getCenter: function () {
        return new L.LatLng( 0, 0 );
      }
    } );

    L.Polyline.include( {
      getCenter: function () {
        var pts = this._latlngs;
        var off = pts[0];
        var twicearea = 0;
        var x = 0;
        var y = 0;
        var nPts = pts.length;
        var p1, p2;
        var f;
        for ( var i = 0, j = nPts - 1; i < nPts; j = i++ ) {
          p1 = pts[i];
          p2 = pts[j];
          f = (p1.lat - off.lat) * (p2.lng - off.lng) - (p2.lat - off.lat) * (p1.lng - off.lng);
          twicearea += f;
          x += (p1.lat + p2.lat - 2 * off.lat) * f;
          y += (p1.lng + p2.lng - 2 * off.lng) * f;
        }
        f = twicearea * 3;
        return new L.LatLng(
          x / f + off.lat,
          y / f + off.lng
        );
      }
    } );

    L.Path.include( {
      getCenter: function () {
        var pts = this._latlngs;
        var off = pts[0];
        var twicearea = 0;
        var x = 0;
        var y = 0;
        var nPts = pts.length;
        var p1, p2;
        var f;
        for ( var i = 0, j = nPts - 1; i < nPts; j = i++ ) {
          p1 = pts[i];
          p2 = pts[j];
          f = (p1.lat - off.lat) * (p2.lng - off.lng) - (p2.lat - off.lat) * (p1.lng - off.lng);
          twicearea += f;
          x += (p1.lat + p2.lat - 2 * off.lat) * f;
          y += (p1.lng + p2.lng - 2 * off.lng) * f;
        }
        f = twicearea * 3;
        return new L.LatLng(
          x / f + off.lat,
          y / f + off.lng
        );
      }
    } );

    L.Path.include( {
      bindPopup: function ( content, options ) {

        if ( content instanceof L.Popup ) {
          this._popup = content;
        }
        else {
          if ( !this._popup || options ) {
            this._popup = new L.Popup( options, this );
          }
          this._popup.setContent( content );
        }

        if ( !this._popupHandlersAdded ) {
          this
            .on( 'click', this.openPopup, this )
            .on( 'remove', this.closePopup, this );

          this._popupHandlersAdded = true;
        }

        return this;
      },

      openPopup: function ( latlng ) {
        if ( this._popup ) {
          this._openPopup( {latlng: this.getCenter()} );
        }
        return this;
      }

    } );

  }

} ));