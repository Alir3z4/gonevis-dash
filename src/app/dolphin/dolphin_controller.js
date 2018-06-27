"use strict";

import app from "../app";

function DolphinController($scope, $rootScope, Dolphin, Codekit, API, AuthService, $state,
                          Upload, Pagination, Search, toaster, source, localStorageService, $translate) {

  var site = AuthService.getCurrentSite();

  function constructor() {
    $scope.view = localStorageService.get("dolphinView") || "list";
    $scope.dolphins = [];
    $scope.dolphinForm = {};
    $scope.search = Search;

    if ($rootScope.selectionMode) {
      $scope.currentTab = "dolphin";
    }

    var payload = {
      site: site
    };
    API.Dolphins.get(payload,
      function(data) {
        angular.forEach(data.results, function(data) {
          $scope.dolphins.push(new Dolphin(data));
        });
        $scope.initialled = true;
        $scope.dolphinForm = Pagination.paginate(
          $scope.dolphinForm, data, {}
        );
        $scope.searchForm = Search.searchify($scope.searchForm, $scope.dolphinForm, API.Dolphins.get, data, payload);
        // Tour is ready
        $rootScope.$broadcast("gonevisDash.Tour.readyToCheck", "files");
      }
    );

    $rootScope.upload = {
      files: [],
      accept: "",
      acceptList: [
        "image/jpeg",
        "image/pjpeg",
        "image/png",
        "image/gif",
        "application/pdf",
        "application/msword",
        "application/x-iwork-keynote-sffkey",
        "application/mspowerpoint",
        "application/powerpoint",
        "application/vnd.ms-powerpoint",
        "application/x-mspowerpoint",
        "application/vnd.oasis.opendocument.text",
        "application/excel",
        "application/vnd.ms-excel",
        "application/x-excel",
        "application/x-msexcel",
        "application/x-compressed",
        "application/x-zip-compressed",
        "application/zip",
        "multipart/x-zip",
        "audio/mpeg3",
        "audio/x-mpeg-3",
        "video/mpeg",
        "video/x-mpeg",
        "audio/x-m4a",
        "audio/ogg",
        "audio/wav",
        "audio/x-wav",
        "video/mp4",
        "video/x-m4v",
        "video/quicktime",
        "video/x-ms-wmv",
        "video/avi",
        "video/msvideo",
        "video/x-msvideo",
        "video/mpeg",
        "video/ogg",
        "video/3gp",
        "video/3gpp2",
      ]
    };
    $rootScope.upload.accept = $rootScope.upload.acceptList.join(",");
  }



  /**
   * @desc Handle for file uploads
   *
   * @param {array} files
   * @param {array} errorFiles
   */
  $scope.uploadFile = function(files, errorFiles) {
    // If there was error, show toaster
    if (errorFiles.length) {
      angular.forEach(errorFiles, function(file) {
        return $translate(
          ["ERROR", "DOLPHIN_UPLOAD_TYPE_ERROR"], {"type": file.name.slice(file.name.lastIndexOf("."))}
        ).then(function(translations) {
          toaster.error(translations.ERROR, translations.DOLPHIN_UPLOAD_TYPE_ERROR);
        });
      });
    }
    $rootScope.upload.files = files;
    $scope.errorFiles = errorFiles;

    angular.forEach($rootScope.upload.files,
      function(file) {
        // UploadUrl payload
        var payload = {
          file_name: file.name,
          file_size: file.size,
          mime_type: file.type
        };
        // Get data from UploadUrl
        API.UploadUrl.post({
            siteId: site
          }, payload,
          function(data) {
            data.post_data.fields.file = file;

            // Upload the file
            file.upload = Upload.upload({
              url: data.post_data.url,
              data: data.post_data.fields,
            });

            // Store data
            file.isImage = file.type.indexOf("image") === 0;
            file.key = data.post_data.fields.key;

            payload = {
              file_key: file.key,
              site: site
            };

            file.upload.then(
              function() {
                API.Dolphins.post(payload,
                  function(data) {
                    file.done = true;
                    toaster.success($translate.instant('UPLOAD_COMPLETED'), file.name);
                    $scope.dolphins.unshift(new Dolphin(data));
                    $scope.currentTab = "dolphin";
                  }
                );
              },
              function() {
                $translate(["ERROR", "UPLOAD_ERROR"]).then(function(translations) {
                  toaster.error(translations.ERROR, translations.UPLOAD_ERROR);
                });
              },
              function(event) {
                file.progress = Math.min(100, parseInt(100.0 * event.loaded / event.total));
              }
            );
          }
        );
      }
    );
  };

  /**
   * @desc Handler for dolphin changes
   */
  function update() {
    Codekit.timeoutSlice($scope.dolphins);
  }

  /**
   * @desc Action is used to determine the action for the current state.
   *
   * @param {Dolphin} dolphin
   */
  $scope.action = function(dolphin) {
    if ($rootScope.selectionMode) {
      $rootScope.$broadcast("gonevisDash.Dolphin:select", dolphin, source);
      $rootScope.selectionMode = false;
      return;
    }
    dolphin.view();
  };

  /**
   * @desc On file drag
   *
   * @param {boolean} isDragging
   * @param {string} dragClass
   * @param {Event} event
   */
  $rootScope.drag = function (isDragging, dragClass, event) {
    let condition = 'removeClass';
    // Check if dragging over page
    if (event.pageX !== 0 || event.pageY !== 0) {
      // Check dragging type
      if (event.dataTransfer.items[0].kind === "string") {
        $rootScope.disableDragging = true;
        return;
      } else {
        $rootScope.disableDragging = false;
      }

      // Check current state
      if ($state.includes("dash.dolphin")) {
        condition = 'addClass';
      }
    }

    angular.element('body')[condition]("drag-over");
  };

  /**
   * @desc Load more function for controller
   */
  $scope.loadMore = Pagination.loadMore;

  $scope.$on("gonevisDash.Dolphin:update", update);
  $scope.$on("gonevisDash.Dolphin:remove", update);

  /**
   * @desc Load more callback
   *
   * @param {Event} event
   * @param {object} data
   */
  $scope.$on("gonevisDash.Pagination:loadedMore", function(event, data) {
    if (data.success) {
      $scope.dolphinForm.page = data.page;
      angular.forEach(data.data.results, function(data) {
        $scope.dolphins.push(new Dolphin(data));
      });
    }
  });

  /**
   * @desc Search callback
   *
   * @param {Event} event
   * @param {object} data
   */
  $scope.$on("gonevisDash.Search:submit", function(event, data) {
    if (data.success) {
      $scope.dolphinForm = data.pageForm;
      $scope.dolphins = [];
      angular.forEach(data.data.results, function(data) {
        $scope.dolphins.push(new Dolphin(data));
      });
      $scope.searchForm = data.form;
    }
  });

  /**
   * @desc Search callback
   */
  if ($state.includes("dash.dolphin")) {
    $scope.$on("gonevisDash.AppRun:fileDropped", function(event, data) {
      $scope.uploadFile(data.files, data.invalidFiles);
    });
  }
  constructor();
}

app.controller("DolphinController", DolphinController);
