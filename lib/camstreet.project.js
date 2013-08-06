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

  angular.module( 'project', ['firebase'] ).
    value( 'fbURL', 'https://camstreet.firebaseio.com/' ).
    //value( 'fbURL', 'https://angularjs-projects.firebaseio.com/' ).
    factory( 'Package', function ( angularFireCollection, fbURL ) {
      return angularFireCollection( fbURL );
    } ).
    config( function ( $routeProvider ) {
      $routeProvider.
        when( '/', {controller: ListCtrl, templateUrl: 'firebase/show'} ).
        //when( '/edit/:projectId', {controller: EditCtrl,   templateUrl: 'detail.html'} ).
        //when( '/new',             {controller: CreateCtrl, templateUrl: 'detail.html'} ).
        otherwise( {redirectTo: '/'} );
    } );

  //yapp.controller('MyCtrl', ['$scope', 'angularFireCollection',
  //                           function MyCtrl($scope, angularFireCollection) {
  //                             $scope.items = angularFireCollection(url);
  //                           }
  //]);

  function ListCtrl( $scope, angularFire ) {
    var promise = angularFire('https://camstreet.firebaseio.com/', $scope, 'package', {});
  }

  /*
   function CreateCtrl( $scope, $location, $timeout, Projects ) {
   $scope.save = function () {
   Projects.add( $scope.project, function () {
   $timeout( function () {
   $location.path( '/' );
   } );
   } );
   }
   }

   function EditCtrl( $scope, $location, $routeParams, angularFire, fbURL ) {
   angularFire( fbURL + $routeParams.projectId, $scope, 'remote', {} ).
   then( function () {
   $scope.project = angular.copy( $scope.remote );
   $scope.project.$id = $routeParams.projectId;
   $scope.isClean = function () {
   return angular.equals( $scope.remote, $scope.project );
   }
   $scope.destroy = function () {
   $scope.remote = null;
   $location.path( '/' );
   };
   $scope.save = function () {
   $scope.remote = angular.copy( $scope.project );
   $location.path( '/' );
   };
   } );
   }
   */

} ));