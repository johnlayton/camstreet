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

  L.Control.Coverage = L.Control.extend( {

    options: {
      position: 'bottomright',
      title: 'Coverage'
    },

    initialize: function ( layer, options ) {
      L.setOptions( this, options );
      this._layer = layer;
    },

    onAdd: function ( map ) {
      var coverageName = 'leaflet-control-coverage',
        container = L.DomUtil.create( 'div', coverageName + ' leaflet-bar' );

      this._map = map;

      this._label =
      this._createLabel( coverageName + '-label', container, this );

      this._slider =
      this._createSlider( coverageName + '-slider', container, this._setRadius, this );

      this._slider.step  = 1;
      this._slider.value = this.options.val;
      this._slider.min   = this.options.min;
      this._slider.max   = this.options.max;

      this._label.innerHTML = this.options.title + ": " + this.options.val + "km";

      return container;
    },

    _setRadius: function ( e ) {
      this._label.innerHTML = this.options.title + ": " + e.target.value + "km";
      this._layer.eachLayer( function ( circle ) {
        circle.setRadius( parseInt( e.target.value ) * 1000 );
      } );
    },

    _createLabel: function ( className, container, context ) {
      var label = L.DomUtil.create( 'div', className, container );
      return label;
    },

    _createSlider: function ( className, container, fn, context ) {
      var slider = L.DomUtil.create( 'input', className, container );
      slider.type = 'range';
      slider.step = 5;
      slider.height = 50;
      slider.width = 150;

      var stop = L.DomEvent.stopPropagation;
      var prev = L.DomEvent.preventDefault;

      L.DomEvent
        .on( slider, 'click', stop )
        .on( slider, 'mousedown', stop )
        .on( slider, 'dblclick', stop )
        .on( slider, 'change', prev )
        .on( slider, 'change', fn, context );

      return slider;
    }
  } );

  L.control.coverage = function ( layer, options ) {
    return new L.Control.Coverage( layer, options );
  };

  L.GeoJSON.Coverage = L.GeoJSON.AJAX.extend( {

    options: {
      min : 0,   // min distance in km (minimum value)
      val : 50,  // val distance in km (initial value)
      max : 200  // max distance in km (maximum value)
    },

    initialize: function ( url, options ) {
      L.GeoJSON.AJAX.prototype.initialize.call( this, url, options );
      this._layer = this.options.layer || L.featureGroup();
      L.setOptions( this, L.extend( this.options, options ) );
    },

    addData: function ( geojson ) {
      L.GeoJSON.AJAX.prototype.addData.call( this, geojson );
      var circle = this.geometryToCoverage( geojson, this.options.pointToCoverage );
      if ( circle ) {
        this._layer.addLayer( circle );
      }
    },

    onAdd: function ( map ) {
      L.GeoJSON.AJAX.prototype.onAdd.call( this, map );
      this._map = map;
      this._control = L.control.coverage( this._layer, this.options );
      this.addLayer( this._layer );
      this._control.addTo( map );
    },

    onRemove: function ( map ) {
      L.GeoJSON.AJAX.prototype.onRemove.call( this, map );
      this._control.removeFrom( map )
    },

    geometryToCoverage: function ( geojson, pointToLayer ) {
      var geometry = geojson.type === 'Feature' ? geojson.geometry : geojson,
        coords = geometry.coordinates,
        layers = [],
        latlng, latlngs, i, len, layer;

      switch ( geometry.type ) {
        case 'Point':
          latlng = L.GeoJSON.coordsToLatLng( coords );
          return L.circle( latlng, (parseInt(this.options.val) * 1000 ) );
        //return pointToLayer ? pointToLayer(geojson, latlng) : new L.Marker(latlng);
        /*
         case 'MultiPoint':
         for (i = 0, len = coords.length; i < len; i++) {
         latlng = this.coordsToLatLng(coords[i]);
         layer = pointToLayer ? pointToLayer(geojson, latlng) : new L.Marker(latlng);
         layers.push(layer);
         }
         return new L.FeatureGroup(layers);

         case 'LineString':
         latlngs = this.coordsToLatLngs(coords);
         return new L.Polyline(latlngs);

         case 'Polygon':
         latlngs = this.coordsToLatLngs(coords, 1);
         return new L.Polygon(latlngs);

         case 'MultiLineString':
         latlngs = this.coordsToLatLngs(coords, 1);
         return new L.MultiPolyline(latlngs);

         case 'MultiPolygon':
         latlngs = this.coordsToLatLngs(coords, 2);
         return new L.MultiPolygon(latlngs);

         case 'GeometryCollection':
         for (i = 0, len = geometry.geometries.length; i < len; i++) {
         layer = this.geometryToLayer({
         geometry: geometry.geometries[i],
         type: 'Feature',
         properties: geojson.properties
         }, pointToLayer);
         layers.push(layer);
         }
         return new L.FeatureGroup(layers);
         */
        case 'FeatureCollection':
          return;

        default:
          throw new Error( 'Invalid GeoJSON object.' );
      }
    }

  } );

  L.geoJson.coverage = function ( url, options ) {
    return new L.GeoJSON.Coverage( url, options );
  };

} ));