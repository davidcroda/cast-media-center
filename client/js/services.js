'use strict';

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('myApp.services', [])

.factory('AuthService', ['$rootScope','$http', function($rootScope, $http) {
    var authService = {};

    authService.login = function(credentials) {
      return $http.post('/login', credentials)
        .then(function(res) {
          $rootScope.user = res.data;
          return res.data;
        })
    };

    authService.isAuthenticated = function () {
      return (typeof $rootScope.user._id != "undefined")
    };

//    authService.isAuthorized = function (authorizedRoles) {
//      if (!angular.isArray(authorizedRoles)) {
//        authorizedRoles = [authorizedRoles];
//      }
//      return (authService.isAuthenticated() &&
//        authorizedRoles.indexOf(Session.userRole) !== -1);
//    };

    return authService;
  }]);