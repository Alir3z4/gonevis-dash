'use strict'

/**
 * @ngdoc function
 * @name gonevisDash.controller:EntryEditController
 * Controller of the gonevisDash
 *
 * @param $scope
 * @param $state
 * @param $stateParams
 * @param $mdToast
 * @param API
 * @param AuthenticationService
 */
function EntryEditController($scope, $state, $stateParams, $mdToast, API, AuthenticationService, $q) {

  var tags = [];

  /**
   * constructor
   *
   * @method constructor
   * @desc Init function for controller
   */
  function constructor() {

    API.Tags.get({ tag_site: AuthenticationService.getCurrentSite() },
      function (data, status, headers, config) {

        for (var i in data.results) {

          tags.push({ slug: data.results[i].slug, id: data.results[i].id, name: data.results[i].name, });
        }
        console.log(tags);

      }
    );

    $scope.form = {
      id: $stateParams.entryId,
      site: AuthenticationService.getCurrentSite()
    };

    $scope.statuses = [
      { name: "Draft", id: 0 },
      { name: "Hidden", id: 1 },
      { name: "Published", id: 2 }
    ];

    API.Entry.get({ entry_id: $scope.form.id },
      function (data, status, headers, config) {
        $scope.form = data;
      }
    )
  }

  $scope.loadTags = function (query) {
    return load();
  };

  function load() {
    var deferred = $q.defer();
    deferred.resolve(tags);
    return deferred.promise;
  };
  /**
   * update
   *
   * @method update
   * @desc Update entry API callback
   * 
   * @param form {object}
   */
  $scope.update = function (form) {
    form.loading = true;

    API.Entry.put({ entry_id: form.id }, form,
      function (data) {
        $mdToast.showSimple("Entry updated!");
        form.loading = false;
        form.errors = null;
      },
      function (data) {
        $mdToast.showSimple("Couldn't update entry!");
        form.loading = false;
        form.errors = data.data;
      }
    );
  }

  /**
   * delete
   *
   * @method delete
   * @desc delete entry via api call
   * 
   * @param id {string} UUID of entry
   */
  $scope.delete = function (id) {
    API.Entry.delete({ entry_id: id },
      function (data) {
        $mdToast.showSimple("Entry has been deleted !");
        $state.go('dash.entry-list');
      },
      function (data) {
        $mdToast.showSimple("Something went wrong... We couldn't delete entry!");
      }
    );
  };

  constructor()
}

app.controller('EntryEditController', EntryEditController)
EntryEditController.$inject = [
  '$scope', '$state', '$stateParams', '$mdToast', 'API', 'AuthenticationService', '$q'
]
