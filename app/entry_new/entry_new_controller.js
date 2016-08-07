'use strict';

/**
 * @ngdoc function
 * @name gonevisDash.controller:EntryNewController
 * Controller of the gonevisDash
 *
 * @param $scope
 * @param $state
 * @param $mdToast
 * @param AuthenticationService
 * @param EntryNewService
 */
function EntryNewController($scope, $state, $mdToast, AuthenticationService, EntryNewService) {

  /**
   * constructor
   *
   * @method constructor
   * @desc Init function for controller
   *
   * @memberOf EntryNewController
   */
  function constructor() {
    // Check auth
    if (!AuthenticationService.isAuthenticated()) {
      return $state.go('signin');
    }

    $scope.form = {};

    $scope.statuses = [
      { name: "Draft", id: 0 },
      { name: "Hidden", id: 1 },
      { name: "Published", id: 2 }
    ];
  };

  /**
   * newPost
   *
   * @method newPost
   * @desc Submit newPost form
   *
   * @param form {object} Form data to submit
   */
  $scope.newPost = function (form) {
    form.loading = true;
    form.site = AuthenticationService.getCurrentSite();

    EntryNewService.create(form).then(
      function (data, status, headers, config) {
        $mdToast.showSimple("Entry added.");
        $state.go('dash.entry-edit', {
          entryId: data.data.id
        });
      },
      function (data, status, headers, config) {
        $mdToast.showSimple("Failed to add entry.");
        form.loading = false;
        form.errors = data.data;
      }
    );
  }

  constructor();
}

app.controller("EntryNewController", EntryNewController);
EntryNewController.$inject = ['$scope', '$state', '$mdToast', 'AuthenticationService', 'EntryNewService'];
