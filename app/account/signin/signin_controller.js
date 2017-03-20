"use strict";

/**
 * @ngdoc function
 * @name gonevisDash.controller:SigninController
 * Controller of the gonevisDash
 * 
 * @param $scope
 * @param $stateParams
 * @param $rootScope
 * @param $state
 * @param $mdToast
 * @param AuthService
 * @param API
 * @param ModalsService
 */
function SigninController($scope, $stateParams, $rootScope, $state, $mdToast, AuthService, API, ModalsService) {

  /**
   * constructor
   *
   * @method constructor
   * @desc Init function for controller
   */
  function constructor() {
    $scope.form = {};
    if ($stateParams.action === "forgot") {
      $scope.forgotPassword();
    }
  }

  /**
   * signin
   *
   * @method signin
   * @desc Submit signin form to authenticate
   *
   * @param form {object}
   */
  $scope.signin = function (form) {
    form.loading = true;

    API.Signin.post({
        username: form.username,
        password: form.password
      },
      function (data) {
        form.loading = false;
        form.errors = null;

        AuthService.setAuthenticatedUser(data.user);
        AuthService.setToken(data.token);

        $rootScope.$broadcast("gonevisDash.AuthService:Authenticated");
        $mdToast.showSimple("Welcome " + data.user.username);
      },
      function (data) {
        form.loading = false;
        form.errors = data.data;
      }
    );
  }

  $scope.forgotPassword = function () {
    ModalsService.open("forgotPassword", "ForgotModalController");
  };

  constructor();
}

app.controller("SigninController", SigninController);
SigninController.$inject = [
  "$scope",
  "$stateParams",
  "$rootScope",
  "$state",
  "$mdToast",
  "AuthService",
  "API",
  "ModalsService",
];
