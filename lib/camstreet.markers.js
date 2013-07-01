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

    L.extend( L.GeoJSON, {
      geometryToLayer: function ( geojson, pointToLayer, coordsToLatLng ) {
        var geometry = geojson.type === 'Feature' ? geojson.geometry : geojson,
          coords = geometry.coordinates,
          layers = [],
          latlng, latlngs, i, len, layer;

        coordsToLatLng = coordsToLatLng || this.coordsToLatLng;

        switch ( geometry.type ) {
          case 'Point':
            latlng = coordsToLatLng( coords );
            return pointToLayer ? pointToLayer( geojson, latlng ) :
                   ( config.point ? config.point( geojson, latlng ) : new L.Marker( latlng ) );

          case 'MultiPoint':
            for ( i = 0, len = coords.length; i < len; i++ ) {
              latlng = coordsToLatLng( coords[i] );
              layer = pointToLayer ? pointToLayer( geojson, latlng ) : new L.Marker( latlng );
              layers.push( layer );
            }
            return new L.FeatureGroup( layers );

          case 'LineString':
            latlngs = this.coordsToLatLngs( coords, 0, coordsToLatLng );
            return new L.Polyline( latlngs );

          case 'Polygon':
            latlngs = this.coordsToLatLngs( coords, 1, coordsToLatLng );
            return new L.Polygon( latlngs );

          case 'MultiLineString':
            latlngs = this.coordsToLatLngs( coords, 1, coordsToLatLng );
            return new L.MultiPolyline( latlngs );

          case 'MultiPolygon':
            latlngs = this.coordsToLatLngs( coords, 2, coordsToLatLng );
            return new L.MultiPolygon( latlngs );

          case 'GeometryCollection':
            for ( i = 0, len = geometry.geometries.length; i < len; i++ ) {

              layer = this.geometryToLayer( {
                geometry: geometry.geometries[i],
                type: 'Feature',
                properties: geojson.properties
              }, pointToLayer );

              layers.push( layer );
            }
            return new L.FeatureGroup( layers );

          default:
            throw new Error( 'Invalid GeoJSON object.' );
        }
      }
      //,

      //coordsToLatLng: function ( coords ) { // (Array[, Boolean]) -> LatLng
      //  return new L.LatLng( coords[1], coords[0] );
      //},
      //
      //coordsToLatLngs: function ( coords, levelsDeep, coordsToLatLng ) { // (Array[, Number, Function]) -> Array
      //  var latlng, i, len,
      //    latlngs = [];
      //
      //  for ( i = 0, len = coords.length; i < len; i++ ) {
      //    latlng = levelsDeep ?
      //             this.coordsToLatLngs( coords[i], levelsDeep - 1, coordsToLatLng ) :
      //             (coordsToLatLng || this.coordsToLatLng)( coords[i] );
      //
      //    latlngs.push( latlng );
      //  }
      //
      //  return latlngs;
      //},
      //
      //latLngToCoords: function ( latLng ) {
      //  return [latLng.lng, latLng.lat];
      //},
      //
      //latLngsToCoords: function ( latLngs ) {
      //  var coords = [];
      //
      //  for ( var i = 0, len = latLngs.length; i < len; i++ ) {
      //    coords.push( L.GeoJSON.latLngToCoords( latLngs[i] ) );
      //  }
      //
      //  return coords;
      //}
    } );

  }
} ));