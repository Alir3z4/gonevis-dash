"use strict";

/**
 * @ngdoc function
 * @name gonevisDash.controller:SigninController
 * Controller of the gonevisDash
 * 
 * @param $scope
 * @param $rootScope
 * @param $state
 * @param toaster
 * @param AuthService
 * @param API
 * @param ModalsService
 */
function SigninController($scope, $rootScope, $state, toaster, AuthService, API, ModalsService) {

  /**
   * constructor
   *
   * @method constructor
   * @desc Init function for controller
   */
  function constructor() {
    $scope.form = {};
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
        toaster.pop({
                type: 'success',
                title: 'Logged in',
                body: "Welcome back " + data.user.username
            });
      },
      function (data) {
        form.loading = false;
        form.errors = data.data;
      }
    );
  };

  $scope.forgotPassword = function () {
    ModalsService.open("forgotPassword", "ForgotModalController");
  };

  constructor();
}

app.controller("SigninController", SigninController);
SigninController.$inject = [
  "$scope",
  "$rootScope",
  "$state",
  "toaster",
  "AuthService",
  "API",
  "ModalsService",
];
