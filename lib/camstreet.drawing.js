(function (root, factory) {
  if (typeof exports === 'object') {
    module.exports = factory();
  } else if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else {
    root.returnExports = factory();
  }
}(this, function () {

  // Code goes here ...
  //return {  hello : function(){ return "hello"; } }
}));