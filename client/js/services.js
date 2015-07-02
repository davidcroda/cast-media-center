'use strict';

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('cast.services', [])

.factory('AuthService', ['$rootScope','$http', function($rootScope, $http) {
    var authService = {};

    authService.login = function(credentials) {
      return $http.post('/login', credentials)
        .then(function(res) {
          authService.update(res.data);

          return res.data;
        })
    };

    authService.update = function(user) {
      $rootScope.user = user;
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

    authService.getUser = function() {
      return $rootScope.user;
    };

    return authService;
  }]);