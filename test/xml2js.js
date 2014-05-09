var request = require( 'request' );
var xml2js = require( 'xml2js' );
var util = require( 'util' );

request( 'http://localhost:8080/thredds/catalog.xml', function ( err, res, body ) {

  //console.log( body );

  new xml2js.Parser().parseString( body, function ( err, data ) {
    console.log( util.inspect( data.catalog.service ) );
    console.log( util.inspect( data.catalog.catalogRef ) );
  } );
} );