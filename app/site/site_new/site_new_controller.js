"use strict";

/**
 * @class SiteNewController
 *
 * @param $scope
 * @param $rootScope
 * @param $state
 * @param API
 * @param AuthService
 */
function SiteNewController($scope, $rootScope, $state, API, AuthService) {

  /**
   * @method constructor
   * @desc Init function for controller
   */
  function constructor() {
    $scope.user = AuthService.getAuthenticatedUser();
  }

  /**
   * @method createSite
   * @desc create site via api call
   *
   * @param form {Object}
   */
  $scope.createSite = function (form) {
    form.loading = true;

    API.SiteNew.save(form,
      function (data) {
        form.loading = false;
        var index = $scope.user.sites.push(data);
        AuthService.setAuthenticatedUser($scope.user);
        $rootScope.$broadcast("gonevisDash.SiteNewController:Create");
        // $mdToast.showSimple("Awesome, created " + data.title + ".");
        $state.go("dash.main", { s: index - 1 });
      },
      function (data) {
        form.errors = data.data;
        form.loading = false;
      }
    );
  };

  constructor();
}

app.controller("SiteNewController", SiteNewController);
SiteNewController.$inject = [
  "$scope",
  "$rootScope",
  "$state",
  "API",
  "AuthService"
];
