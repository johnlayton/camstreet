var tap      = require('tap');
var template = require( '../lib/camstreet.template.js' );

tap.test('console', function (t) {
  process.stderr.write( template.properties( 'test', { a:1, b:2 } ) );
});
