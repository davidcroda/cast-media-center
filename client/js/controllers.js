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
        console.log('Settings $scope.videos to ', videos);
        $scope.videos = videos;
        clearTimeout($rootScope.timeout);
        $rootScope.timeout = setTimeout($scope.loadVideos, 5000);
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
      $http.post('/api/refresh', {}).success(function () {
        $scope.refreshVideos();
      });
    };

    $rootScope.$on('indexVideos', $scope.indexVideos);
    $rootScope.$on('refreshVideos', $scope.refreshVideos);

    $scope.refreshVideos();

  }])


  .controller('TorrentListController', ['$scope', '$rootScope', '$http', function($scope, $rootScope, $http) {

    $scope.formatSize = function(bytes) {

      if(bytes == undefined) {
        bytes = 0;
      }

      if(bytes > 0) {
        bytes = bytes / (1024 * 1024)
      }

      return bytes.toFixed(2);
    };

    $scope.STATUSES = [
      "stopped",
      "queued_to_check_files",
      "checking_files",
      "queued_to_download",
      "downloading",
      "queued_to_seed",
      "seeding"
    ];


    $scope.getTorrents = function() {

      $http.get('/api/torrent').success(function(data) {

        data.torrents.map(function(torrent) {
          torrent.rateDownload = $scope.formatSize(torrent.rateDownload);
          torrent.rateUpload = $scope.formatSize(torrent.rateUpload);
          torrent.totalSize = $scope.formatSize(torrent.totalSize);
          torrent.status = $scope.STATUSES[torrent.status];

          torrent.seederCount = torrent.trackerStats.reduce(function(carry, trackerStat) {
            return carry + trackerStat.seederCount;
          }, 0);
          torrent.leecherCount = torrent.trackerStats.reduce(function(carry, trackerStat) {
            return carry + trackerStat.leecherCount;
          }, 0);
        });

        $scope.torrents = data.torrents;
        $rootScope.timeout = setTimeout($scope.getTorrents, 5000);
      });

    };

    $scope.deleteTorrent = function(id) {
      $http.delete('/api/torrent/' + id).success(function() {
        $scope.torrents = $scope.torrents.filter(function(torrent) {
          return torrent.id != id;
        })
      });

    };

    $scope.getTorrents();

  }])


  .controller('LoginController', ['$scope', '$rootScope', '$location', '$routeParams', '$window', 'AUTH_EVENTS', 'AuthService',
    function ($scope, $rootScope, $location, $routeParams, $window, AUTH_EVENTS, AuthService) {

      $scope.credentials = {
        username: '',
        password: '',
        remember_me: ''
      };


      $scope.login = function (credentials) {
        AuthService.login(credentials).then(function (user) {
          console.log(user);
          $rootScope.$broadcast(AUTH_EVENTS.loginSuccess);
          if(typeof $routeParams.redirect != "undefined") {
            console.log($routeParams.redirect);
            window.location.href = "http://" + window.location.host + $routeParams.redirect;
            console.log(window.location.href);
          } else {
            $location.url("/");
          }

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