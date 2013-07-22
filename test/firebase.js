var Firebase = require( 'firebase' );
var Generator = require( "firebase-token-generator" );
var util = require( 'util' )

const secret = "ZTRmQC5MvuQEqfHEcvd7pRpEzu31mXA5olkyptqF"
//const secret = "bob"
const url = 'https://camstreet.firebaseio.com/';

//var myRootRef = new Firebase( url );
//myRootRef.set( "hello - world!" );

var tokenGenerator = new Generator( secret );
var token = tokenGenerator.createToken( {
  some: "arbitrary",
  data: "here"
} );

console.log( "*******************" );
console.log( util.inspect( token ) );
console.log( "*******************" );

var dataRef = new Firebase( url );
dataRef.auth( token, function ( error, result ) {
  if ( error ) {
    console.log( "Login Failed!", error );
    return;
  }
  else {
    console.log( util.inspect( result ) );
    console.log( 'Authenticated successfully with payload:', result.auth );
    console.log( 'Auth expires at:', new Date( result.expires * 1000 ) );

    dataRef.set({first: 'Fred', last: 'Flintstone'});

  }
} );