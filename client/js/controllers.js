'use strict';

/* Controllers */

angular.module('cast.controllers', [])

  .controller('VideoListController', ['$scope', '$rootScope', '$http', '$location', 'chromecast', function ($scope, $rootScope, $http, $location, chromecast) {

    $scope.chromecast = new chromecast($scope);

    $scope.orderProp = 'date';

    $scope.setActive = function (video, $event) {
      if (!$event.shiftKey) {
        angular.forEach($scope.videos, function (video) {
          video.active = false
        }, $scope.videos);
      }
      video.active = true;
    };

    $scope.refreshVideos = function () {
      console.log('calling refreshVideos');
      $http.get('/api/video').success(function (data) {
        var videos = data.video;
        angular.forEach(videos, function (video, key) {
          video.canPlay = (video.vcodec == "h264" && video.acodec == "aac");
          videos[key] = video;
        });
        $scope.videos = videos;
        clearTimeout($scope.timeout);
        $scope.timeout = setTimeout($scope.loadVideos, 5000);
      }).
        error(function (data, status, headers, config) {
          if (status == 401) {
            $location.url("/login");
          } else {
            console.log(data, status, headers, config);
          }
        })
    };

    $scope.playVideo = function (video) {
      $scope.chromecast.loadMedia(video, $scope);
    };

    $scope.deleteVideos = function () {
      angular.forEach($scope.videos, function (video) {
        if (video.active) {
          $http.delete('/api/video/' + video.id).success(function () {
            $scope.videos = _.without($scope.videos, video);
            console.log("Deleted Video " + video.id);
          });
        }
      });
    };

    $scope.indexVideos = function () {
      console.log('calling indexVideos');
      $http.get('/api/refresh').success(function () {
        $scope.refreshVideos();
      });
    };

    $rootScope.$on('indexVideos', $scope.indexVideos);
    $rootScope.$on('refreshVideos', $scope.refreshVideos);

    $scope.refreshVideos();

  }])

  .controller('VideoController', ['$scope', '$routeParams', '$http', function ($scope, $routeParams, $http) {
    $http.get('/api/video/' + $routeParams.id).success(function (data) {
      $scope.phone = data;
    });
  }])

  .controller('LoginController', ['$scope', '$rootScope', '$location', 'AUTH_EVENTS', 'AuthService',
    function ($scope, $rootScope, $location, AUTH_EVENTS, AuthService) {

      $scope.credentials = {
        username: '',
        password: '',
        remember_me: ''
      };


      $scope.login = function (credentials) {
        AuthService.login(credentials).then(function (user) {
          console.log(user);
          $rootScope.$broadcast(AUTH_EVENTS.loginSuccess);
          $location.url("/");
        }, function () {
          $rootScope.$broadcast(AUTH_EVENTS.loginFailed);
        })
      }
    }])

  .controller('HeaderController', ['$scope', '$rootScope', '$location', function ($scope, $rootScope, $location) {

    $scope.isActive = function (viewLocation) {
      return viewLocation === $location.path();
    };

    $scope.indexVideos = function () {
      console.log("$emit indexVideos");
      $rootScope.$emit('indexVideos');
    };

    $scope.refreshVideos = function () {
      console.log("$emit refreshVideos");
      $rootScope.$emit('refreshVideos');
    };
  }]);