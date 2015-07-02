'use strict';

/* Controllers */

angular.module('cast.controllers', [])

  .controller('VideoListController', ['$scope', '$http', '$location', 'chromecast', function ($scope, $http, $location, chromecast) {

    console.log($scope.$parent);

    $scope.chromecast = new chromecast($scope);

    $scope.orderProp = 'title';

    $scope.$on('indexVideos', function(event) {
      $scope.indexVideos();
    });
    $scope.$on('refreshVideos', function(event) {
      $scope.refreshVideos();
    });

    $scope.setActive = function (chosenVideo, $event) {
      if (!$event.shiftKey && !$event.ctrlKey) {
        angular.forEach($scope.videos, function (video) {
          video.active = false
        }, $scope.videos);
      } else if ($event.shiftKey) {
        var isActive = false;
        angular.forEach($scope.videos, function (video) {
          if (video._id == chosenVideo._id) {
            isActive = false;
          } else if(!isActive && video.isActive) {
            isActive = true;
          } else {
            video.active = isActive;
          }
        }, $scope.videos);
      }
      chosenVideo.active = true;
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
      $http.post('/api/refresh', {}).success(function () {
        $scope.refreshVideos();
      });
    };

    $scope.refreshVideos();

  }])


  .controller('TorrentListController', ['$scope', '$rootScope', '$http', function($scope, $rootScope, $http) {

    $scope.formatSize = function(bytes) {

      if(bytes === undefined) {
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
          torrent.percentDone = torrent.percentDone.toFixed(3);

          torrent.seederCount = torrent.trackerStats.reduce(function(carry, trackerStat) {
            return carry + trackerStat.seederCount;
          }, 0);
          torrent.leecherCount = torrent.trackerStats.reduce(function(carry, trackerStat) {
            return carry + trackerStat.leecherCount;
          }, 0);
        });

        $scope.torrents = data.torrents;
        $scope.timeout = setTimeout($scope.getTorrents, 5000);
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

  .controller('SettingsController', ['$scope', '$http', 'AuthService',
    function($scope, $http, AuthService) {

      $scope.user = AuthService.getUser();

      $scope.update = function(user) {
        $http.post('/api/user/' + user._id, user).success(function(user) {
          AuthService.update(user);
        });
      }

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
            window.location.href = "//" + window.location.host + $routeParams.redirect;
            console.log(window.location.href);
          } else {
            $location.url("/");
          }

        }, function () {
          $rootScope.$broadcast(AUTH_EVENTS.loginFailed);
        })
      }
    }])

  .controller('AppController', ['$scope', '$location', function ($scope, $location) {

    $scope.isActive = function (viewLocation) {
      return viewLocation === $location.path();
    };

    $scope.indexVideos = function () {
      console.log("$broadcast indexVideos");
      $scope.$broadcast('indexVideos');
    };

    $scope.refreshVideos = function () {
      console.log("$broadcast refreshVideos");
      $scope.$broadcast('refreshVideos');
    };
  }]);
