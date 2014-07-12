'use strict';

/* Controllers */

angular.module('myApp.controllers', [])

  .controller('VideoListController', ['$scope', '$http', '$location', 'chromecast', function ($scope, $http, $location, chromecast) {
    chromecast = new chromecast($scope);
    $http.get('http://localhost:3000/api/video').success(function (data) {
      var videos = data.video;
      angular.forEach(videos, function (video, key) {
        video.canPlay = (video.vcodec == "h264" && video.acodec == "aac");
        videos[key] = video;
      });
      $scope.videos = videos;
    }).
      error(function (data, status, headers, config) {
        if (status == 401) {
          $location.url("/login");
        } else {
          console.log(data, status, headers, config);
        }
      });

    $scope.orderProp = 'date';

    $scope.setActive = function (video) {
      angular.forEach($scope.videos, function (video) {
        video.active = false
      }, $scope.videos);
      video.active = true;
    };

    $scope.playVideo = function (video) {
      chromecast.loadMedia(video, $scope);
    };

    $scope.deleteVideo = function (video) {
      $http.delete('http://localhost:3000/api/video/' + video.id);
    };

  }])

  .controller('VideoController', ['$scope', '$routeParams', '$http', function ($scope, $routeParams, $http) {
    $http.get('http://localhost:3000/api/video/' + $routeParams.id).success(function (data) {
      $scope.phone = data;
    });
  }])

  .controller('SourceController', ['$scope', '$http', function ($scope, $http) {
    $scope.index = function () {
      $http.get('http://localhost:3000/api/source').success(function (data) {
        $scope.sources = data.source;
      });
    };

    $scope.add = function (source) {
      $http.put('http://localhost:3000/api/source', source).success(function () {
        $scope.index();
      });
    };

    $scope.delete = function (source) {
      $http.delete('http://localhost:3000/api/source/' + source._id).success(function () {
        $scope.index();
      })
    };

    $scope.index();

  }])

  .controller('LoginController', ['$scope', '$rootScope', '$location', 'AUTH_EVENTS', 'AuthService',
    function ($scope, $rootScope, $location, AUTH_EVENTS, AuthService) {

    $scope.credentials = {
      username: '',
      pasword: ''
    };

    $scope.login = function(credentials) {
      AuthService.login(credentials).then(function(user) {
        console.log(user);
        $rootScope.$broadcast(AUTH_EVENTS.loginSuccess);
        $location.url("/");
      }, function() {
        $rootScope.$broadcast(AUTH_EVENTS.loginFailed);
      })
    }
  }]);