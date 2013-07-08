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
    } );

  }
} ));