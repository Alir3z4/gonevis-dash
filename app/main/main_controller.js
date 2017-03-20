"use strict";

/**
 * @class MainController
 *
 * @param $scope
 * @param $state
 * @param $mdToast
 * @param AuthService
 * @param API
 * @param Codekit
 * @param CommentService
 * @param Entry
 */
function MainController($scope, $state, $mdToast, $stateParams,
  AuthService, API, Codekit, CommentService, Entry) {

  var site = AuthService.getCurrentSite();

  /**
   * @method constructor
   * @desc Init function for controller
   */
  function constructor() {
    $scope.auth = AuthService;
    $scope.user = AuthService.getAuthenticatedUser();

    $scope.state = $state;
    $scope.param = $stateParams;

    $scope.Comment.initialize();
    $scope.Entry.initialize();
    $scope.Metrics.initialize();
  }

  /**
   * @name Comment
   * @type {Object}
   */
  $scope.Comment = {
    /**
     * @name service
     * @desc Object service
     * @type {Service}
     */
    service: CommentService,
    /**
     * @method initialize
     * @desc initialize comments
     */
    initialize: function () {
      $scope.Comment.loading = true;

      API.Comments.get({ site: site },
        function (data) {
          $scope.Comment.loading = true;
          $scope.Comment.list = data.results;
        }
      );
    }
  };

  /**
   * @name Entry
   * @type {Object}
   */
  $scope.Entry = {
    /**
     * @name list
     * @type Array
     */
    list: [],
    /**
     * @method initialize
     * @desc Initialize entries
     */
    initialize: function () {
      $scope.Entry.loading = true;

      API.Entries.get({ site: site },
        function (data) {
          $scope.Entry.loading = true;
          angular.forEach(data.results, function (data) {
            $scope.Entry.list.push(new Entry(data));
          });
        }
      );
    }
  };

  /**
   * @name Metrics
   * @type {Object}
   */
  $scope.Metrics = {
    /**
     * @method initialize
     * @desc Initialize metrics
     */
    initialize: function () {
      $scope.Metrics.loading = true;

      API.SiteMetrics.get({ siteId: site },
        function (data) {
          $scope.Metrics.loading = false;
          $scope.Metrics.list = data.metrics;
        }
      );
    }
  };

  constructor();
}

app.controller("MainController", MainController);
MainController.$inject = [
  "$scope",
  "$state",
  "$mdToast",
  "$stateParams",
  "AuthService",
  "API",
  "Codekit",
  "CommentService",
  "Entry"
];
