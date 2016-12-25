"use strict";

/**
 * @ngdoc function
 * @name gonevisDash.controller:NavigationController
 * Controller of the gonevisDash
 *
 * @param $scope
 * @param $rootScope
 * @param $state
 * @param $mdToast
 * @param AuthService
 */
function NavigationController($scope, $rootScope, $state, $mdToast, API, AuthService) {

  var site = AuthService.getCurrentSite();

  /**
   * constructor
   *
   * @method constructor
   * @desc Init function for controller
   */
  function constructor() {
    $scope.navigations = [];

    API.Navigation.get({ site_id: site },
      function (data) {
        $scope.initialled = true;
        $scope.navigations = data.navigation;
      }
    );
  }

  /**
   * update
   *
   * @method update
   * @desc function for updating navigations
   *
   * @param form {Object}
   */
  $scope.update = function (form) {
    form.loading = true;

    for (var n in $scope.navigations) {
      $scope.navigations[n].sort_number = n;
    }

    API.UpdateNavigation.put({ site_id: site }, { navigation: $scope.navigations },
      function (data) {
        form.loading = false;
        $scope.navigations = data.navigation;
        $mdToast.showSimple("Navigation updated.");
      },
      function () {
        form.loading = false;
        $mdToast.showSimple("Couldn't update navigation, please try again later.");
      }
    );
  };

  /**
   * create
   *
   * @method create
   * @desc Nav creation function
   */
  $scope.create = function () {
    $scope.navigations.push({
      label: "New Nav",
      url: "/",
      sort_number: $scope.navigations.length + 1
    });
  };

  /**
   * remove
   *
   * @method remove
   * @desc Nav deletion function
   *
   * @param index {Number}
   */
  $scope.remove = function (index) {
    $scope.navigations.splice(index, 1);
  };

  constructor();
}

app.controller("NavigationController", NavigationController);
NavigationController.$inject = [
  "$scope",
  "$rootScope",
  "$state",
  "$mdToast",
  "API",
  "AuthService"
];
