var gulp = require( 'gulp' );
var tap = require( 'gulp-tap' );
var debug = require( 'gulp-debug' );
var through = require( 'through2' );
var util = require( 'util' );

gulp.task( 'bundle', function () {
  gulp.src( 'lib/*.js' )
    .pipe( through.obj( function ( file, enc, callback ) {
      console.log( util.inspect( file.path ) );
      if ( file.isNull() ) {
        // Do nothing if no contents
      }
      if ( file.isBuffer() ) {
        //file.contents = Buffer.concat( [prefixText, file.contents] );
      }

      if ( file.isStream() ) {
        //file.contents = file.contents.pipe( prefixStream( prefixText ) );
      }

      this.push( file );
      return callback();

    } ) )
    .pipe(gulp.dest('./build'));
} );

gulp.task( 'watch', ['bundle'], function () {
  gulp.watch( 'lib/*.js', ['bundle'] );
} );