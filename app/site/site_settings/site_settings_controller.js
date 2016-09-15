'use strict';

/**
 * @ngdoc function
 * @name gonevisDash.controller:SiteSettingsController
 * Controller of the gonevisDash
 *
 * @param $scope
 * @param $rootScope
 * @param $state
 * @param $mdToast
 * @param API
 * @param AuthService
 */
function SiteSettingsController($scope, $rootScope, $state, $mdToast, API, AuthService) {

  var site = AuthService.getCurrentSite()

  /**
   * constructor
   *
   * @method constructor
   * @desc Init function for controller
   */
  function constructor() {
    $scope.user = AuthService.getAuthenticatedUser();

    API.Site.get({ site_id: site },
      function (data, status, headers, config) {
        $scope.siteDetail = data;
        console.log($scope.siteDetail);
      },
      function (data, status, headers, config) {
        console.log(data);
      }
    );
  };

  /**
   * updateSite
   *
   * @method updateSite
   * @desc update site via api call
   *
   * @param key {string} value {string} site {string}
   */
  $scope.updateSite = function (key, value) {
    $mdToast.showSimple('Updating ' + key + '...');

    var payload = {};
    payload[key] = value;

    API.SiteUpdate.put({ site_id: site }, payload,
      function (data, status, headers, config) {
        $scope.siteDetail = data;
        $mdToast.showSimple("Profile update.");
      },
      function (data, status, headers, config) {
        $mdToast.showSimple("" + data.data.title + "");
      }
    );
  }

  /**
   * delete
   *
   * @method delete
   * @desc delete site via api call
   *
   * @param siteId {string}
   */
  $scope.delete = function (siteId) {

    API.SiteUpdate.delete({ site_id: site },
      function (data, status, headers, config) {
        $mdToast.showSimple("Site deleted");
        $state.go('dash.main', { s: $scope.user.sites.length - 2 });
      },
      function (data, status, headers, config) {
        console.log(data);
      }
    );
  }

  constructor();
}

app.controller("SiteSettingsController", SiteSettingsController);
SiteSettingsController.$inject = ['$scope', '$rootScope', '$state', '$mdToast', 'API', 'AuthService'];
