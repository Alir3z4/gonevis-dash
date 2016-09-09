'use strict'

/**
 * @ngdoc function
 * @name gonevisDash.controller:DolphinListController
 * Controller of the gonevisDash
 *
 * @param $scope
 * @param $state
 * @param $stateParams
 * @param $mdToast
 * @param ModalsService
 * @param API
 * @param ENV
 * @param AuthenticationService
 * @param Upload
 */
function DolphinListController($scope, $rootScope, $state, $stateParams, $mdToast, ModalsService, API, ENV, AuthenticationService, Upload) {

  var site = AuthenticationService.getCurrentSite();

  /**
   * constructor
   *
   * @method constructor
   * @desc Init function for controller
   */
  function constructor() {
    API.Dolphins.get({},
      function (data) {
        $scope.dolphins = data.results;
      }
    );

    $scope.upload = {
      files: [],
      accept: "",
      acceptList: [
        'image/jpeg',
        'image/pjpeg',
        'image/png',
        'image/gif',
        'application/pdf',
        'application/msword',
        'application/x-iwork-keynote-sffkey',
        'application/mspowerpoint',
        'application/powerpoint',
        'application/vnd.ms-powerpoint',
        'application/x-mspowerpoint',
        'application/vnd.oasis.opendocument.text',
        'application/excel',
        'application/vnd.ms-excel',
        'application/x-excel',
        'application/x-msexcel',
        'application/x-compressed',
        'application/x-zip-compressed',
        'application/zip',
        'multipart/x-zip',
        'audio/mpeg3',
        'audio/x-mpeg-3',
        'video/mpeg',
        'video/x-mpeg',
        'audio/x-m4a',
        'audio/ogg',
        'audio/wav',
        'audio/x-wav',
        'video/mp4',
        'video/x-m4v',
        'video/quicktime',
        'video/x-ms-wmv',
        'video/avi',
        'video/msvideo',
        'video/x-msvideo',
        'video/mpeg',
        'video/ogg',
        'video/3gp',
        'video/3gpp2',
      ]
    }
    $scope.upload.accept = $scope.upload.acceptList.join(',');
  }

  $rootScope.$on('getDolphin', function (event, data) {
    for (var i = 0; i < $scope.dolphins.length; i++) {
      if ($scope.dolphins[i].id == data.id) {
        $scope.dolphins[i] = data
      }
    }
  });

  /**
   * uploadFiles
   *
   * @method uploadFiles
   * @desc Handle for file uploads
   *
   * @param files {File}
   * @param errFiles {File}
   */
  $scope.uploadFiles = function (files, errFiles) {
    $scope.upload.files = files;
    $scope.errFiles = errFiles;

    console.log(files, errFiles);

    angular.forEach($scope.upload.files,
      function (file) {
        file.upload = Upload.upload({
          url: ENV.apiEndpoint + 'dolphin/file/',
          data: { file: file, site: site }
        });

        file.upload.then(
          function (data) {
            $mdToast.showSimple("Upload completed.");
            $scope.dolphins.push(data.data);
          },
          function (data) {
            $mdToast.showSimple("Upload failed.");
          },
          function (event) {
            file.progress = Math.min(
              100, parseInt(100.0 * event.loaded / event.total)
            );
          }
        );
      }
    );
  }

  /**
   * viewDolphin
   *
   * @method viewDolphin
   * @desc Open up dolphin detail via modal
   *
   * @param id {Number}
   */
  $scope.viewDolphin = function (id) {
    ModalsService.open("dolphin", "DolphinController", { id: id });
  }

  constructor()
}

app.controller('DolphinListController', DolphinListController)
DolphinListController.$inject = [
  '$scope',
  '$rootScope',
  '$state',
  '$stateParams',
  '$mdToast',
  'ModalsService',
  'API',
  'ENV',
  'AuthenticationService',
  'Upload'
]
