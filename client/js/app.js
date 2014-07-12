'use strict';


// Declare app level module which depends on filters, and services
angular.module('myApp', [
  'ngRoute',
  'myApp.filters',
  'myApp.services',
  'myApp.directives',
  'myApp.controllers',
  'excast',
  'ng-context-menu'
]).
config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/', {templateUrl: 'partials/video_list.html', controller: 'VideoListController'});
  $routeProvider.when('/login', {templateUrl: 'partials/login.html', controller: 'LoginController'});
  $routeProvider.when('/sources', {templateUrl: 'partials/sources.html', controller: 'SourceController'});
  $routeProvider.when('/videos/:id', {templateUrl: 'partials/video.html', controller: 'VideoController'});
  $routeProvider.otherwise({redirectTo: '/'});
}])
.constant('AUTH_EVENTS', {
    loginSuccess: 'auth-login-success',
    loginFailed: 'auth-login-failed',
    logoutSuccess: 'auth-logout-success',
    sessionTimeout: 'auth-session-timeout',
    notAuthenticated: 'auth-not-authenticated',
    notAuthorized: 'auth-not-authorized'
  });