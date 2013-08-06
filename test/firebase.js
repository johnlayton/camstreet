const Firebase = require( 'firebase' );
const Generator = require( "firebase-token-generator" );
const util = require( 'util' );

const secret = "ZTRmQC5MvuQEqfHEcvd7pRpEzu31mXA5olkyptqF"
const url    = 'https://camstreet.firebaseio.com/';

var token = function () {
  return new Generator( secret ).createToken( {
    some: "arbitrary",
    data: "here"
  } );
}

var dataRef = new Firebase( url );
dataRef.auth( token(), function ( error, result ) {
  if ( error ) {
    console.log( "Login Failed!", error );
    return;
  }
  else {
    console.log( 'Authenticated successfully with payload:', result.auth );
    console.log( 'Auth expires at:', new Date( result.expires * 1000 ) );

    console.log( dataRef.child( "author" ).toString() );
    dataRef.child( "dependencies" ).once( 'value', function ( snapshot ) {
      console.log( util.inspect( snapshot.val() ) );
    } );

    dataRef.unauth();
  }
} );