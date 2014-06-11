'use strict';


// Declare app level module which depends on filters, and services
angular.module('myApp', [
  'ngRoute',
  'myApp.filters',
  'myApp.services',
  'myApp.directives',
  'myApp.controllers',
  'excast'
]).
config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/', {templateUrl: 'partials/video_list.html', controller: 'VideoListController'});
  $routeProvider.when('/sources', {templateUrl: 'partials/sources.html', controller: 'SourceController'});
  $routeProvider.when('/videos/:id', {templateUrl: 'partials/video.html', controller: 'VideoController'});
  $routeProvider.otherwise({redirectTo: '/'});
}]);