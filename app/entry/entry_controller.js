"use strict";

/**
 * @class EntryController
 *
 * @param $scope
 * @param $rootScope
 * @param $state
 * @param Entry
 * @param API
 * @param AuthService
 * @param Pagination
 * @param Search
 */
function EntryController($scope, $rootScope, $state,
  Entry, Codekit, API, AuthService, Pagination, Search) {

  /**
   * @method constructor
   * @desc Init function for controller
   */
  function constructor() {
    $scope.view = localStorage.entryView || "list";
    $scope.filters = { title: "" };
    $scope.statuses = Codekit.entryStatuses;
    $scope.search = Search;
    $scope.pageForm = {};
    $scope.entries = [];
    $scope.actions = [{
      label: "Draft",
      icon: "edit",
      property: "status",
      value: 0
    }, {
      label: "Published",
      icon: "globe",
      property: "status",
      value: 1,
    }, {
      label: "Set to featured",
      icon: "star",
      property: "featured",
      value: true
    }, {
      label: "Remove from Featured",
      icon: "close",
      property: "featured",
      value: false
    }, {
      label: "Enable comments",
      icon: "comments",
      property: "comment_enabled",
      value: true
    }, {
      label: "Disable comments",
      icon: "close",
      property: "comment_enabled",
      value: false
    }];

    var payload = { site: AuthService.getCurrentSite() };

    API.Entries.get(payload,
      function (data) {
        angular.forEach(data.results, function (item) {
          $scope.entries.push(new Entry(item));
        });
        $scope.initialled = true;
        $scope.pageForm = Pagination.paginate($scope.pageForm, data, payload);
        $scope.searchForm = Search.searchify($scope.searchForm, $scope.pageForm, API.Entries.get, data, payload);
      }
    );
  }

  /**
   * @method setProperty
   * @desc set property of selected entries
   *
   * @param key {String}
   * @param value {Boolian|Number}
   */
  $scope.setProperty = function (key, value) {
    angular.forEach($scope.entries, function (entry) {
      if (entry.isSelected) {
        entry.setProperty(key, value);
      }
    });
  };

  /**
   * @method setView
   * @desc Set item view style
   *
   * @param view {String}
   */
  $scope.setView = function (view) {
    $scope.view = view;
    localStorage.entryView = view;
  };

  /**
   * @method removeSelected
   * @desc Remove selected entries
   */
  $scope.removeSelected = function () {

    if (confirm("Delete selected entries?\nDeleting entries can not be undone!") === true) {
      angular.forEach($scope.entries, function (entry) {
        if (entry.isSelected) {
          entry.remove();
        }
      });
    } else {
      return;
    }
  };

  /**
   * @method countSelected
   * @desc Count selected entries
   */
  $scope.countSelected = function () {
    $scope.selectCount = 0;
    angular.forEach($scope.entries, function (entry) {
      if (entry.isSelected) {
        $scope.selectCount++;
      }
    });
  };

  /**
   * @method loadMore
   * @desc Load more function for controller
   */
  $scope.loadMore = Pagination.loadMore;

  /**
   * @event gonevisDash.Pagination:loadedMore
   * @desc Load more callback
   *
   * @param event {Event}
   * @param data {Object}
   */
  $scope.$on("gonevisDash.Pagination:loadedMore", function (event, data) {
    if (data.success) {
      $scope.pageForm.page = data.page;
      $scope.entries = $scope.entries.concat(data.data.results);
    }
  });

  /**
   * @event gonevisDash.Search:submit
   * @desc Search callback
   *
   * @param event {Event}
   * @param data {Object}
   */
  $scope.$on("gonevisDash.Search:submit", function (event, data) {
    if (data.success) {
      $scope.pageForm = data.pageForm;
      $scope.entries = data.data.results;
      $scope.searchForm = data.form;
    }
  });

  constructor();
}

app.controller("EntryController", EntryController);
EntryController.$inject = [
  "$scope",
  "$rootScope",
  "$state",
  "Entry",
  "Codekit",
  "API",
  "AuthService",
  "Pagination",
  "Search"
];
