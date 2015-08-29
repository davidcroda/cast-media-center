(function() {
  'use strict';


  // Declare app level module which depends on filters, and services
  angular.module('cast', [
    'ngRoute',
    'cast.filters',
    'cast.services',
    'cast.directives',
    'cast.controllers',
    'Chromecast',
    'ng-context-menu'
  ]).
  config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/', {templateUrl: 'views/video_list.html', controller: 'VideoListController'});
    $routeProvider.when('/login', {templateUrl: 'views/login.html', controller: 'LoginController'});
    $routeProvider.when('/torrents', {templateUrl: 'views/torrent_list.html', controller: 'TorrentListController'});
    $routeProvider.when('/settings', {templateUrl: 'views/settings.html', controller: 'SettingsController'});
    $routeProvider.when('/videos/:id', {templateUrl: 'views/video.html', controller: 'VideoController'});
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
})();
