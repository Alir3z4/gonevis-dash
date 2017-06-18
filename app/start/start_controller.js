"use strict";

/**
 * @class StartController
 *
 * @param $scope
 * @param $timeout
 * @param Password
 * @param API
 */
function StartController($scope, $timeout, Password, API) {

  /**
   * @method constructor
   */
  function constructor() {

    // List of steps
    $scope.steps = ["domain", "template", "sign up"];

    // Current step
    $scope.step = 0;

    // Domain name and data
    $scope.domainForm = {
      loading: false,
      available: false,
      name: null,
      error: null
    };

    // Final signup form data
    $scope.signupForm = {
      loading: false,
      success: false,
      errors: null
    };

    // Toggle password visibility
    $scope.showPassword = false;

    // Password class to check strength
    $scope.password = new Password();

    // Get site templates
    API.SiteTemplatesPublic.get({},
      function (data) {
        $scope.templates = data.results;
        $scope.selectedTemplate = $scope.templates[0];
      },
      function () {
        // Failed to get templates, this step is skipped
        $scope.steps.slice($scope.steps.indexOf("template"), 1);
      }
    );
  }

  /**
   * @method signup
   * @desc Submit signup form
   * 
   * @param form {Object}
   */
  $scope.signup = function (form) {
    form.loading = true;

    var payload = {
      password: $scope.password.password,
      email: form.data.email,
      template_id: $scope.selectedTemplate.id,
      site_name: $scope.domainForm.name,
      site_url: $scope.domainForm.name
    };

    API.Signup.post(payload,
      function () {
        form.errors = [];
        $scope.success = true;
      },
      function (data) {
        form.loading = false;
        form.errors = data.data;
      }
    );
  };

  constructor();
}

app.controller("StartController", StartController);
StartController.$inject = [
  "$scope",
  "$timeout",
  "Password",
  "API"
];
