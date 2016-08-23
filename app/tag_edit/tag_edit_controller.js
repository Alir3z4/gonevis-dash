'use strict';

/**
 * @ngdoc function
 * @name gonevisDash.controller:TagEditController
 * Controller of the gonevisDash
 *
 * @param $scope
 * @param $rootScope
 * @param $state
 * @param $mdToast
 * @param $stateParams
 * @param API
 * @param AuthenticationService
 */
function TagEditController($scope, $rootScope, $state, $mdToast, $stateParams, API, AuthenticationService) {
  
  var site = AuthenticationService.getCurrentSite();

  /**
   * constructor
   *
   * @method constructor
   * @desc Init function for controller
   */
  function constructor() {
    $scope.user = AuthenticationService.getAuthenticatedUser();
    updatedTag();
  };

  function updatedTag() {
    API.Tag.get({ tag_site: site, tag_id: $stateParams.tagId },
      function (data, status, headers, config) {
        $scope.form = data;
      });
  }

  /**
   * updateTag
   *
   * @method updateTag
   * @desc for updating tag details
   * 
   * @param form {object}
   */
  $scope.updateTag = function (form) {
    form.loading = true;

    API.Tag.put({ tag_site: site, tag_id: $stateParams.tagId }, form,
      function (data, status, headers, config) {
        form.loading = false;
        updatedTag();
        $mdToast.showSimple("Tag updated.");
      },
      function (data, status, headers, config) {
        form.loading = false;
      }
    );
  }

  constructor();
}

app.controller("TagEditController", TagEditController);
TagEditController.$inject = ['$scope', '$rootScope', '$state', '$mdToast', '$stateParams', 'API', 'AuthenticationService'];
