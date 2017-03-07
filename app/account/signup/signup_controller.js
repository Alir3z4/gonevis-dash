"use strict";

/**
 * @ngdoc function
 * @name gonevisDash.controller:SigninController
 * Controller of the gonevisDash
 *
 * @param $scope
 * @param $state
 * @param $mdToast
 * @param AuthService
 * @param API
 */
function SignupController($scope, $state, $mdToast, AuthService, API) {

  /**
   * @method constructor
   * @desc Init function for controller
   */
  function constructor() {

    // Check auth
    if (AuthService.isAuthenticated()) {
      $state.go("main");
    }
  };

  /**
   * @method signup
   * @desc Submit signup form
   * 
   * @param form {object}
   */
  $scope.signup = function register(form) {
    form.loading = true;

    API.Signup.post({
        email: form.email,
        username: form.username,
        password: form.password
      },
      function (data) {
        form.errors = [];
        $scope.registeredEmail = data.email;
        $scope.success = true;
      },
      function (data) {
        form.loading = false;
        form.errors = data.data;
      }
    );
  };

  /**
   * @method resend
   * @desc Resend email confirmation
   *
   * @param email {String}
   */
  $scope.resend = function (email) {
    API.EmailConfirmationResend.save({email: email},
      function () {
        $mdToast.showSimple("We've send a confirmation link to your email.");
      }
    )
  };

  constructor();
}

app.controller("SignupController", SignupController);
SignupController.$inject = [
  "$scope",
  "$state",
  "$mdToast",
  "AuthService",
  "API"
];
